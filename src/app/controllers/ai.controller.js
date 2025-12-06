import { getAuth } from '@clerk/express';
import { streamText, convertToModelMessages } from 'ai';
import { z } from 'zod';
import * as chatService from '../services/chat.service.js';
import {
  BMC_SYSTEM_PROMPT,
  postBmcToDatabase,
  updateBmcToDatabase,
  getUserCoordinates,
  performWebSearch,
} from '../services/ai.service.js';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// Setup Kolosal provider (OpenAI-compatible)
// const kolosal = createOpenAI({
//   apiKey: process.env.KOLOSAL_API_KEY,
//   baseURL: "https://api.kolosal.ai/v1",
//   headers: {
//   'Authorization': 'Bearer ' + process.env.KOLOSAL_API_KEY,
//   }
// });

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// const modelName = process.env.KOLOSAL_MODEL_NAME || 'Kimi K2';

const modelName = "moonshotai/kimi-k2-0905"

/**
 * Check if string is valid UUID v4
 */
function isValidUUID(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * POST /api/chat/:chatId? - Stream chat with AI (AI SDK compatible)
 * - chatId dari URL params (optional)
 * - messages dari body (UIMessage[] format)
 */
export async function streamChat(req, res) {
  const { chatId } = req.params;
  const { messages } = req.body; // UIMessage[] dari useChat
  const { userId } = getAuth(req);

  // Validasi messages
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Messages cannot be empty.',
    });
  }

  // Ambil pesan user terakhir untuk logging & title
  const lastUserMessage = messages.findLast((m) => m.role === 'user');
  const userMessageContent = extractTextFromMessage(lastUserMessage);

  console.log(`\n--- START STREAM CHAT (User: ${userId}) ---`);
  console.log(`[INPUT] "${userMessageContent?.substring(0, 40)}..."`);

  try {
    let currentChatId = null;
    let detectedBmcId = null;
    let dbHistory = [];
    let isNewChat = true;

    // --- 1. LOAD OR CREATE CHAT SESSION ---
    // Validasi chatId - harus valid UUID
    if (!chatId || !isValidUUID(chatId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid chat ID (UUID) is required.',
      });
    }

    // Check if chat exists
    const chatExists = await chatService.getChatById(chatId);
    
    if (chatExists) {
      // Existing chat - verify ownership
      if (!chatService.userOwnsChat(chatExists, userId)) {
        return res.status(404).json({
          success: false,
          message: 'Invalid chat session.',
        });
      }

      // Load history dari DB untuk deteksi BMC ID
      const historyResult = await chatService.buildAIMessageHistory(chatId);
      dbHistory = historyResult.history;
      detectedBmcId = historyResult.detectedBmcId;
      currentChatId = chatId;
      isNewChat = false;

      console.log(
        `[HISTORY] ${dbHistory.length} messages in DB. BMC ID: ${detectedBmcId || 'None'}`,
      );
    } else {
      // Create new chat with UUID from frontend
      const title = userMessageContent?.substring(0, 50) || 'New Chat';
      const newChat = await chatService.createChat(chatId, userId, title);
      currentChatId = newChat._id; // UUID string
      console.log(`[CHAT] New session created: ${currentChatId}`);
    }

    // --- 2. SAVE USER MESSAGE TO DB ---
    if (userMessageContent) {
      await chatService.createMessage(currentChatId, 'user', userMessageContent);
    }

    // --- 3. BUILD DYNAMIC SYSTEM PROMPT ---
    let systemPrompt = BMC_SYSTEM_PROMPT;
    if (detectedBmcId) {
      systemPrompt += `\n\n[SYSTEM INFO]:\nActive BMC ID for this session is: "${detectedBmcId}".\nUse this ID to call updateBmcToDatabase function.`;
    }

    // --- 4. DEFINE TOOLS ---
    const tools = {
      getUserCoordinates: {
        description:
          'Get user location coordinates. Optional - call this if you want to include location data in BMC.',
        parameters: z.object({}),
        execute: async () => {
          console.log(`[EXEC] ⚙️ getUserCoordinates for user: ${userId}`);
          const result = await getUserCoordinates(userId);
          console.log(`[EXEC] ⚙️ getUserCoordinates result:`, result);
          return result;
        },
      },
      postBmcToDatabase: {
        description:
          'Save a new BMC to database. REQUIRED: bmcData array with at least one block. Example: bmcData: [{tag: "customer_segments", content: "Young professionals aged 25-35"}]',
        parameters: z.object({
          coordinates: z
            .object({
              lat: z.number(),
              lon: z.number(),
            })
            .optional()
            .describe('Optional location coordinates'),
          bmcData: z
            .array(
              z.object({
                tag: z
                  .string()
                  .describe(
                    'BMC block tag. Use snake_case: customer_segments, value_propositions, channels, customer_relationships, revenue_streams, key_resources, key_activities, key_partnerships, cost_structure',
                  ),
                content: z.string().min(1).describe('Content/description for this BMC block'),
              }),
            )
            .min(1)
            .describe('Array of BMC blocks. Each block has tag (snake_case) and content'),
        }),
        execute: async ({ bmcData, coordinates }) => {
          console.log(`[EXEC] ⚙️ postBmcToDatabase with ${bmcData?.length} items`);
          console.log(`[EXEC] ⚙️ bmcData:`, JSON.stringify(bmcData));
          console.log(`[EXEC] ⚙️ Coordinates:`, coordinates || 'using default');
          
          // Validate bmcData before calling service
          if (!bmcData || !Array.isArray(bmcData) || bmcData.length === 0) {
            console.error(`[EXEC] ❌ bmcData is empty or invalid`);
            return {
              status: 'failed',
              message: 'bmcData is required. Provide at least one BMC block with tag and content.',
              example: { tag: 'customer_segments', content: 'Your target customer description' },
            };
          }
          
          const result = await postBmcToDatabase(bmcData, coordinates, userId);
          console.log(`[EXEC] ⚙️ postBmcToDatabase result:`, result);
          return result;
        },
      },
      updateBmcToDatabase: {
        description: 'Update existing BMC with new or modified blocks. Use the bmcId from previous postBmcToDatabase result or from system info.',
        parameters: z.object({
          bmcId: z.string().describe('The BMC ID to update (from postBmcToDatabase result or system info)'),
          bmcData: z
            .array(
              z.object({
                tag: z
                  .string()
                  .describe(
                    'BMC block tag. Use snake_case: customer_segments, value_propositions, channels, customer_relationships, revenue_streams, key_resources, key_activities, key_partnerships, cost_structure',
                  ),
                content: z.string().min(1).describe('Content/description for this BMC block'),
              }),
            )
            .min(1)
            .describe('Complete array of all BMC blocks (replaces existing)'),
        }),
        execute: async ({ bmcId, bmcData }) => {
          console.log(`[EXEC] ⚙️ updateBmcToDatabase ID: ${bmcId}, items: ${bmcData?.length}`);
          const result = await updateBmcToDatabase(bmcId, bmcData, userId);
          console.log(`[EXEC] ⚙️ updateBmcToDatabase result:`, result);
          return result;
        },
      },
      performWebSearch: {
        description: 'Search the web for market research, competitor analysis, industry data, or any factual information needed for BMC analysis.',
        parameters: z.object({
          query: z.string().min(3).describe('Search query - be specific for better results'),
        }),
        execute: async ({ query }) => {
          console.log(`[EXEC] ⚙️ performWebSearch: ${query}`);
          const result = await performWebSearch(query);
          console.log(`[EXEC] ⚙️ performWebSearch found ${result.results?.length || 0} results`);
          return result;
        },
      },
    };

    // --- 5. STREAM WITH AI SDK ---
    console.log(`[AI] Streaming with AI SDK...`);

    let fullResponse = '';
    let toolCallsExecuted = [];

    const result = streamText({
      model: openrouter(modelName),
      system: systemPrompt,
      messages: convertToModelMessages(messages),
      tools,
      maxSteps: 10, // Allow more steps for complex tool chains
      toolChoice: 'auto', // Explicitly set tool choice
      onStepFinish: async ({ stepType, text, toolCalls, toolResults }) => {
        // Track tool executions for DB persistence
        if (stepType === 'tool-result' && toolResults) {
          for (const result of toolResults) {
            toolCallsExecuted.push({
              toolName: result.toolName,
              args: result.args,
              result: result.result,
              toolCallId: result.toolCallId,
            });
          }
        }
      },
      onFinish: async ({ text, steps }) => {
        // --- 6. SAVE AI RESPONSE TO DB ---
        fullResponse = text || '';

        // Save tool calls and results to DB
        for (const step of steps) {
          if (step.toolCalls && step.toolCalls.length > 0) {
            // Save assistant message with tool_calls
            await chatService.createMessage(
              currentChatId,
              'assistant',
              step.text || '',
              step.toolCalls.map((tc) => ({
                id: tc.toolCallId,
                type: 'function',
                function: {
                  name: tc.toolName,
                  arguments: JSON.stringify(tc.args),
                },
              })),
            );

            // Save tool results
            if (step.toolResults) {
              for (const tr of step.toolResults) {
                await chatService.createMessage(
                  currentChatId,
                  'tool',
                  JSON.stringify(tr.result),
                  null,
                  tr.toolCallId,
                );
              }
            }
          }
        }

        // Save final text response
        if (fullResponse) {
          await chatService.createMessage(currentChatId, 'assistant', fullResponse);
          await chatService.touchChat(currentChatId);
          console.log(`[DB] Response saved. Length: ${fullResponse.length}`);
        }
      },
    });

    // --- 7. STREAM RESPONSE TO EXPRESS ---
    return result.pipeUIMessageStreamToResponse(res, {
      messageMetadata: ({ part }) => {
        if (part.type === 'finish') {
          return {
            chatId: currentChatId,
            isNewChat,
          };
        }
        return undefined;
      },
    });
  } catch (error) {
    console.error(`[FATAL ERROR]`, error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error.',
      error: error.message,
    });
  }
}

/**
 * Extract text content from UIMessage
 */
function extractTextFromMessage(message) {
  if (!message) return null;

  // Handle UIMessage with parts
  if (message.parts && Array.isArray(message.parts)) {
    const textParts = message.parts
      .filter((p) => p.type === 'text')
      .map((p) => p.text);
    return textParts.join('');
  }

  // Handle legacy format with content string
  if (typeof message.content === 'string') {
    return message.content;
  }

  return null;
}

/**
 * GET /api/chat - Get all chats for user
 */
export async function getChats(req, res) {
  const { userId } = getAuth(req);

  try {
    const chats = await chatService.getChatsByUserId(userId);
    return res.status(200).json({
      success: true,
      data: chats.map((chat) => ({
        id: chat._id,
        title: chat.title,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get Chats Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get chat list.',
    });
  }
}

/**
 * GET /api/chat/:chatId/messages - Get messages for a chat
 */
export async function getChatMessages(req, res) {
  const { chatId } = req.params;
  const { userId } = getAuth(req);

  try {
    const chat = await chatService.getChatById(chatId);
    if (!chat || !chatService.userOwnsChat(chat, userId)) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    const messages = await chatService.getUserFacingMessages(chatId);
    return res.status(200).json({
      success: true,
      data: messages.map((msg) => ({
        id: msg._id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get Chat Messages Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get chat messages.',
    });
  }
}

/**
 * DELETE /api/chat/:chatId - Delete a chat
 */
export async function deleteChatById(req, res) {
  const { chatId } = req.params;
  const { userId } = getAuth(req);

  try {
    const deletedChat = await chatService.deleteChat(chatId, userId);
    if (!deletedChat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Chat deleted successfully.',
    });
  } catch (error) {
    console.error('Delete Chat Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete chat.',
    });
  }
}
