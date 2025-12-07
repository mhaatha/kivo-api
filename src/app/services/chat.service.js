import * as chatRepository from '../repositories/chat.repository.js';

/**
 * Create a new chat session with custom UUID
 * @param {string} chatId - UUID from frontend
 * @param {string} userId - User ID from auth
 * @param {string} title - Chat title
 */
export async function createChat(chatId, userId, title = 'New Chat') {
  return chatRepository.createChat({ _id: chatId, userId, title });
}

/**
 * Get chat by ID
 */
export async function getChatById(chatId) {
  return chatRepository.findChatById(chatId);
}

/**
 * Get chats by user ID
 */
export async function getChatsByUserId(userId) {
  return chatRepository.findChatsByUserId(userId);
}

/**
 * Update chat title
 */
export async function updateChatTitle(chatId, title) {
  return chatRepository.updateChatById(chatId, { title });
}

/**
 * Update chat timestamp
 */
export async function touchChat(chatId) {
  return chatRepository.updateChatById(chatId, { updatedAt: new Date() });
}

/**
 * Delete chat and its messages
 */
export async function deleteChat(chatId, userId) {
  const chat = await chatRepository.findOneChat({ _id: chatId, userId });
  if (!chat) return null;
  
  await chatRepository.deleteMessages({ chatId });
  await chatRepository.deleteChatById(chatId);
  return chat;
}

/**
 * Create a message
 */
export async function createMessage(chatId, role, content, toolCalls = null, toolCallId = null, location = null) {
  const messageData = { chatId, role, content };
  if (toolCalls) messageData.tool_calls = toolCalls;
  if (toolCallId) messageData.tool_call_id = toolCallId;
  if (location) messageData.location = location;
  
  return chatRepository.createMessage(messageData);
}

/**
 * Get latest location from chat messages
 */
export async function getLatestLocationFromChat(chatId) {
  const message = await chatRepository.findOneMessage(
    {
      chatId,
      location: { $ne: null },
    },
    {
      sort: { createdAt: -1 },
      select: 'location',
      lean: true,
    }
  );

  return message?.location || null;
}

/**
 * Get messages for chat
 */
export async function getMessagesByChatId(chatId) {
  return chatRepository.findMessagesByChatId(chatId);
}

/**
 * Get user-facing messages only (user and assistant roles)
 */
export async function getUserFacingMessages(chatId) {
  return chatRepository.findMessages(
    { 
      chatId, 
      role: { $in: ['user', 'assistant'] } 
    },
    {
      sort: { createdAt: 1 },
      select: 'role content createdAt',
    }
  );
}

/**
 * Build message history for AI (including tool messages)
 */
export async function buildAIMessageHistory(chatId) {
  const messages = await chatRepository.findMessages(
    { chatId },
    {
      sort: { createdAt: 1 },
      lean: true,
    }
  );
  
  let detectedBmcId = null;
  
  const history = messages
    .filter((msg) => ['user', 'assistant', 'tool'].includes(msg.role))
    .map((msg) => {
      // Check for BMC ID in tool messages
      if (msg.role === 'tool' && msg.content) {
        try {
          const parsed = JSON.parse(msg.content);
          if (parsed.bmcId) detectedBmcId = parsed.bmcId;
        } catch (e) {
          // Ignore parse errors
        }
        if (!msg.tool_call_id) return null;
        return { role: 'tool', content: msg.content, tool_call_id: msg.tool_call_id };
      }
      
      // Assistant messages
      if (msg.role === 'assistant') {
        const hasTool = msg.tool_calls && msg.tool_calls.length > 0;
        const hasContent = msg.content && msg.content.trim().length > 0;
        if (!hasTool && !hasContent) return null;
        
        const m = { role: 'assistant' };
        if (hasTool) m.tool_calls = msg.tool_calls;
        if (hasContent) m.content = msg.content;
        return m;
      }
      
      // User messages
      if (msg.role === 'user') {
        return { role: 'user', content: msg.content };
      }
      
      return null;
    })
    .filter((msg) => msg !== null);
  
  return { history, detectedBmcId };
}

/**
 * Check if user owns chat
 */
export function userOwnsChat(chat, userId) {
  return chat && chat.userId === userId;
}
