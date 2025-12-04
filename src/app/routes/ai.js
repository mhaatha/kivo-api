import { Router } from 'express';
import { requireAuth } from '@clerk/express';
import {
  streamChat,
  getChats,
  getChatMessages,
  deleteChatById,
} from '../controllers/ai.controller.js';

const router = Router();

// POST /api/chat - Stream chat with AI
router.post('/', requireAuth(), streamChat);

// GET /api/chats - Get all chats for user
router.get('/', requireAuth(), getChats);

// GET /api/chat/:chatId/messages - Get messages for a chat
router.get('/:chatId/messages', requireAuth(), getChatMessages);

// DELETE /api/chat/:chatId - Delete a chat
router.delete('/:chatId', requireAuth(), deleteChatById);

export default router;
