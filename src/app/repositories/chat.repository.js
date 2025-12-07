import { Chat, Message } from '../models/chat.model.js';

/**
 * Create a new chat
 */
export async function createChat(chatData) {
  const chat = new Chat(chatData);
  return chat.save();
}

/**
 * Find chat by ID
 */
export async function findChatById(chatId) {
  return Chat.findById(chatId);
}

/**
 * Find chats by user ID
 */
export async function findChatsByUserId(userId) {
  return Chat.find({ userId }).sort({ updatedAt: -1 });
}

/**
 * Update chat by ID
 */
export async function updateChatById(chatId, updateData) {
  return Chat.findByIdAndUpdate(chatId, updateData, { new: true });
}

/**
 * Delete chat by ID
 */
export async function deleteChatById(chatId) {
  return Chat.findByIdAndDelete(chatId);
}

/**
 * Find one chat by filter
 */
export async function findOneChat(filter) {
  return Chat.findOne(filter);
}

/**
 * Create a new message
 */
export async function createMessage(messageData) {
  const message = new Message(messageData);
  return message.save();
}

/**
 * Find messages by chat ID
 */
export async function findMessagesByChatId(chatId) {
  return Message.find({ chatId }).sort({ createdAt: 1 });
}

/**
 * Find messages by filter
 */
export async function findMessages(filter, options = {}) {
  let query = Message.find(filter);
  
  if (options.sort) {
    query = query.sort(options.sort);
  }
  
  if (options.select) {
    query = query.select(options.select);
  }
  
  if (options.lean) {
    query = query.lean();
  }
  
  return query;
}

/**
 * Find one message by filter
 */
export async function findOneMessage(filter, options = {}) {
  let query = Message.findOne(filter);
  
  if (options.sort) {
    query = query.sort(options.sort);
  }
  
  if (options.select) {
    query = query.select(options.select);
  }
  
  if (options.lean) {
    query = query.lean();
  }
  
  return query;
}

/**
 * Delete many messages by filter
 */
export async function deleteMessages(filter) {
  return Message.deleteMany(filter);
}
