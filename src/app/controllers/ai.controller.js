import * as chatService from '../services/chat.service.js';
import * as aiService from '../services/ai.service.js';
import { validateStreamChatRequest } from '../validations/ai.validation.js';

/**
 * POST /api/chat - Stream chat with AI
 */
export async function streamChat(req, res) {
  const { message, chatId } = req.body;
  const userId = req.user.id;

  // Validate request
  const validation = validateStreamChatRequest(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Message cannot be empty.',
      details: validation.error?.errors,
    });
  }

  console.log(`\n--- START STREAM CHAT (User: ${userId}) ---`);
  console.log(`[INPUT] "${message.substring(0, 40)}..."`);

  try {
    let currentChatId;
    let history = [];
    let detectedBmcId = null;

    // --- 1. LOAD HISTORY ---
    if (chatId) {
      const chatExists = await chatService.getChatById(chatId);
      if (!chatExists || !chatService.userOwnsChat(chatExists, userId)) {
        return res.status(404).json({
          success: false,
          message: 'Invalid chat session.',
        });
      }

      const historyResult = await chatService.buildAIMessageHistory(chatId);
      history = historyResult.history;
      detectedBmcId = historyResult.detectedBmcId;
      currentChatId = chatId;

      console.log(
        `[HISTORY] ${history.length} messages loaded. BMC ID detected: ${detectedBmcId || 'None'}`,
      );
    } else {
      // Create new chat
      const newChat = await chatService.createChat(userId, message.substring(0, 50));
      currentChatId = newChat._id;
      console.log(`[CHAT] New session created: ${currentChatId}`);
    }

    // --- 2. SAVE USER MESSAGE ---
    await chatService.createMessage(currentChatId, 'user', message);

    // --- 3. PREPARE MESSAGES WITH DYNAMIC SYSTEM PROMPT ---
    let dynamicSystemPrompt = aiService.BMC_SYSTEM_PROMPT;
    if (detectedBmcId) {
      dynamicSystemPrompt += `\n\n[SYSTEM INFO]:\nActive BMC ID for this session is: "${detectedBmcId}".\nUse this ID to call updateBmcToDatabase function.`;
    }

    const messagesToSend = [
      { role: 'system', content: dynamicSystemPrompt },
      ...history,
      { role: 'user', content: message },
    ];

    // --- 4. FIRST AI CALL ---
    console.log(`[AI CALL 1] Calling Model...`);
    const response = await aiService.getChatCompletion(messagesToSend, false);
    const responseMessage = response.choices[0].message;

    // --- 5. HANDLE TOOL CALLS ---
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      console.log(`[TOOL] ✅ AI called ${responseMessage.tool_calls.length} functions.`);

      // Save assistant intent
      await chatService.createMessage(
        currentChatId,
        'assistant',
        responseMessage.content || '',
        responseMessage.tool_calls,
      );

      messagesToSend.push(responseMessage);

      // Execute each tool
      for (const toolCall of responseMessage.tool_calls) {
        const fnName = toolCall.function.name;
        const fnArgs = toolCall.function.arguments
          ? JSON.parse(toolCall.function.arguments)
          : {};

        console.log(`[EXEC] ⚙️ ${fnName}`);
        const toolResult = await aiService.executeTool(fnName, fnArgs, userId);
        const toolContent = JSON.stringify(toolResult);

        // Save tool result
        await chatService.createMessage(
          currentChatId,
          'tool',
          toolContent,
          null,
          toolCall.id,
        );

        messagesToSend.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: fnName,
          content: toolContent,
        });
      }

      // --- 6. SECOND AI CALL (FINAL STREAMING RESPONSE) ---
      console.log(`[AI CALL 2] Streaming final answer...`);
      const finalResponseStream = await aiService.getStreamingCompletion(messagesToSend);

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      let aiFinalResponse = '';
      for await (const chunk of finalResponseStream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          res.write(
            `data: ${JSON.stringify({ chunk: content, chatId: currentChatId, isNewChat: !chatId })}\n\n`,
          );
          aiFinalResponse += content;
        }
      }
      res.end();

      if (aiFinalResponse) {
        await chatService.createMessage(currentChatId, 'assistant', aiFinalResponse);
        await chatService.touchChat(currentChatId);
      }
      return;
    }

    // --- 7. HANDLE NORMAL CHAT (NO TOOL) ---
    console.log(`[AI CALL 1] Directly streaming answer...`);
    const stream = await aiService.getStreamingCompletion(messagesToSend);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    let aiResponse = '';
    let isFirstChunk = true;

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(
          `data: ${JSON.stringify({
            chunk: content,
            chatId: currentChatId,
            isNewChat: isFirstChunk && !chatId,
          })}\n\n`,
        );
        aiResponse += content;
        isFirstChunk = false;
      }
    }
    res.end();

    if (aiResponse) {
      await chatService.createMessage(currentChatId, 'assistant', aiResponse);
      await chatService.touchChat(currentChatId);
    }
  } catch (error) {
    console.error(`[FATAL ERROR]`, error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Server error.',
        error: error.message,
      });
    }
    res.write(`data: ${JSON.stringify({ error: 'Server Error' })}\n\n`);
    res.end();
  }
}

/**
 * GET /api/chats - Get all chats for user
 */
export async function getChats(req, res) {
  const userId = req.user.id;

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
  const userId = req.user.id;

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
  const userId = req.user.id;

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
