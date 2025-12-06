import { getAuth } from '@clerk/express';
import * as chatService from '../services/chat.service.js';
import { runBmcAgent } from '../ai/agent/bmc.agent.js';

/**
 * Check if string is valid UUID v4
 */
function isValidUUID(id) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Extract text content from UIMessage
 */
function extractTextFromMessage(message) {
  if (!message) return null;

  if (message.parts && Array.isArray(message.parts)) {
    const textParts = message.parts
      .filter((p) => p.type === 'text')
      .map((p) => p.text);
    return textParts.join('');
  }

  if (typeof message.content === 'string') {
    return message.content;
  }

  return null;
}

/**
 * POST /api/chat/:chatId - Stream chat with AI (AI SDK compatible)
 */
export async function streamChat(req, res) {
  const { chatId } = req.params;
  const { messages } = req.body;
  const { userId } = getAuth(req);

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Messages cannot be empty.',
    });
  }

  if (!chatId || !isValidUUID(chatId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid chat ID (UUID) is required.',
    });
  }

  const lastUserMessage = messages.findLast((m) => m.role === 'user');
  const userMessageContent = extractTextFromMessage(lastUserMessage);

  console.log(`\n--- START STREAM CHAT (User: ${userId}) ---`);
  console.log(`[INPUT] "${userMessageContent?.substring(0, 40)}..."`);

  try {
    let currentChatId = null;
    let isNewChat = true;

    // --- 1. LOAD OR CREATE CHAT SESSION ---
    const chatExists = await chatService.getChatById(chatId);

    if (chatExists) {
      if (!chatService.userOwnsChat(chatExists, userId)) {
        return res.status(404).json({
          success: false,
          message: 'Invalid chat session.',
        });
      }

      currentChatId = chatId;
      isNewChat = false;
      console.log(`[CHAT] Existing session: ${currentChatId}`);
    } else {
      const title = userMessageContent?.substring(0, 50) || 'New Chat';
      const newChat = await chatService.createChat(chatId, userId, title);
      currentChatId = newChat._id;
      console.log(`[CHAT] New session created: ${currentChatId}`);
    }

    // --- 2. SAVE USER MESSAGE TO DB ---
    const { location } = req.body;
    if (userMessageContent) {
      await chatService.createMessage(currentChatId, 'user', userMessageContent, null, null, location);
    }

    // --- 3. RUN BMC AGENT ---
    console.log(`[AI] Running BMC Agent...`);

    const result = await runBmcAgent({
      userId,
      chatId: currentChatId,
      messages,
      isNewChat,
    });

    // --- 6. STREAM RESPONSE TO EXPRESS ---
    return result.pipeUIMessageStreamToResponse(res, {
      messageMetadata: ({ part }) => {
        if (part.type === 'finish') {
          return { chatId: currentChatId, isNewChat };
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
