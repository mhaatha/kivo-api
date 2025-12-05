import { Chat, Message } from '../models/chat.model.js';

/**
 * Create a new chat session
 */
export async function createChat(userId, title = 'New Chat') {
  const chat = new Chat({ userId, title });
  return chat.save();
}

/**
 * Get chat by ID
 */
export async function getChatById(chatId) {
  return Chat.findById(chatId);
}

/**
 * Get chats by user ID
 */
export async function getChatsByUserId(userId) {
  return Chat.find({ userId }).sort({ updatedAt: -1 });
}

/**
 * Update chat title
 */
export async function updateChatTitle(chatId, title) {
  return Chat.findByIdAndUpdate(chatId, { title }, { new: true });
}

/**
 * Update chat timestamp
 */
export async function touchChat(chatId) {
  return Chat.findByIdAndUpdate(chatId, { updatedAt: new Date() });
}

/**
 * Delete chat and its messages
 */
export async function deleteChat(chatId, userId) {
  const chat = await Chat.findOne({ _id: chatId, userId });
  if (!chat) return null;
  
  await Message.deleteMany({ chatId });
  await Chat.findByIdAndDelete(chatId);
  return chat;
}

/**
 * Create a message
 */
export async function createMessage(chatId, role, content, toolCalls = null, toolCallId = null) {
  const messageData = { chatId, role, content };
  if (toolCalls) messageData.tool_calls = toolCalls;
  if (toolCallId) messageData.tool_call_id = toolCallId;
  
  const message = new Message(messageData);
  return message.save();
}

/**
 * Get messages for chat
 */
export async function getMessagesByChatId(chatId) {
  return Message.find({ chatId }).sort({ createdAt: 1 });
}

/**
 * Get user-facing messages only (user and assistant roles)
 */
export async function getUserFacingMessages(chatId) {
  return Message.find({ 
    chatId, 
    role: { $in: ['user', 'assistant'] } 
  })
    .sort({ createdAt: 1 })
    .select('role content createdAt');
}

/**
 * Build message history for AI (including tool messages)
 */
export async function buildAIMessageHistory(chatId) {
  // 1. Ambil pesan dengan .lean()
  const messages = await Message.find({ chatId })
    .sort({ createdAt: 1 })
    .lean();
  
  let detectedBmcId = null;
  
  const history = messages
    .filter((msg) => ['user', 'assistant', 'tool'].includes(msg.role))
    .map((msg) => {
      
      // A. HANDLE TOOL OUTPUT (Respon dari function)
      if (msg.role === 'tool') {
        // Cek ID BMC jika ada
        try {
          if (msg.content) {
            const parsed = JSON.parse(msg.content);
            if (parsed.bmcId) detectedBmcId = parsed.bmcId;
          }
        } catch (e) { /* ignore */ }
        
        // Tool message WAJIB punya tool_call_id & content (harus string)
        if (!msg.tool_call_id) return null;
        
        return { 
            role: 'tool', 
            content: msg.content || '', // Pastikan tidak null/undefined
            tool_call_id: msg.tool_call_id 
        };
      }
      
      // B. HANDLE ASSISTANT (Model response)
      if (msg.role === 'assistant') {
        const hasTool = msg.tool_calls && msg.tool_calls.length > 0;
        const rawContent = msg.content;
        const hasContent = rawContent && rawContent.trim().length > 0;
        
        // Skip jika pesan kosong total
        if (!hasTool && !hasContent) return null;
        
        const m = { role: 'assistant' };
        
        // --- FIX CRITICAL: REKONSTRUKSI TOOL CALLS ---
        if (hasTool) {
            m.tool_calls = msg.tool_calls.map(tc => {
                // Pastikan arguments adalah STRING. 
                // Jika MongoDB menyimpannya sebagai Object, kita harus stringify balik.
                let argsString = tc.function.arguments;
                if (typeof argsString !== 'string') {
                    argsString = JSON.stringify(argsString);
                }

                return {
                    id: tc.id,             
                    type: tc.type || 'function',
                    function: {
                        name: tc.function.name,
                        arguments: argsString // <--- INI KUNCINYA (Harus String)
                    }
                };
            });
        }

        // --- FIX CONTENT NULLABILITY ---
        if (hasContent) {
            m.content = rawContent;
        } else {
            m.content = null; // Wajib null jika tool_calls ada tapi text tidak ada
        }

        return m;
      }
      
      // C. HANDLE USER
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


