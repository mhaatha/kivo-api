import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TEST_USERS, SAMPLE_CHAT_MESSAGES } from '../setup.js';

// Mock Clerk's getAuth
vi.mock('@clerk/express', () => ({
  getAuth: vi.fn((req) => ({ userId: req.user?.id })),
}));

// Mock the services and validations
vi.mock('../../src/app/services/chat.service.js', () => ({
  getChatById: vi.fn(),
  getChatsByUserId: vi.fn(),
  createChat: vi.fn(),
  createMessage: vi.fn(),
  buildAIMessageHistory: vi.fn(),
  getUserFacingMessages: vi.fn(),
  deleteChat: vi.fn(),
  touchChat: vi.fn(),
  userOwnsChat: vi.fn(),
}));

vi.mock('../../src/app/services/ai.service.js', () => ({
  BMC_SYSTEM_PROMPT: 'Test system prompt',
  getChatCompletion: vi.fn(),
  getStreamingCompletion: vi.fn(),
  executeTool: vi.fn(),
}));

vi.mock('../../src/app/validations/ai.validation.js', () => ({
  validateStreamChatRequest: vi.fn(),
}));

describe('AI Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      user: { id: TEST_USERS.user1.id },
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      writeHead: vi.fn(),
      write: vi.fn(),
      end: vi.fn(),
      headersSent: false,
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getChats', () => {
    it('should return empty array when user has no chats', async () => {
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatsByUserId.mockResolvedValue([]);

      const { getChats } = await import('../../src/app/controllers/ai.controller.js');
      await getChats(mockReq, mockRes);

      expect(chatService.getChatsByUserId).toHaveBeenCalledWith(TEST_USERS.user1.id);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it('should return list of chats for authenticated user', async () => {
      const chatService = await import('../../src/app/services/chat.service.js');
      const mockChats = [
        { _id: 'chat1', title: 'Business Model Discussion', createdAt: new Date(), updatedAt: new Date() },
        { _id: 'chat2', title: 'Startup Planning', createdAt: new Date(), updatedAt: new Date() },
      ];
      chatService.getChatsByUserId.mockResolvedValue(mockChats);

      const { getChats } = await import('../../src/app/controllers/ai.controller.js');
      await getChats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'chat1', title: 'Business Model Discussion' }),
          expect.objectContaining({ id: 'chat2', title: 'Startup Planning' }),
        ]),
      });
    });

    it('should use correct user ID from request', async () => {
      mockReq.user.id = TEST_USERS.user2.id;
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatsByUserId.mockResolvedValue([]);

      const { getChats } = await import('../../src/app/controllers/ai.controller.js');
      await getChats(mockReq, mockRes);

      expect(chatService.getChatsByUserId).toHaveBeenCalledWith(TEST_USERS.user2.id);
    });

    it('should return 500 on service error', async () => {
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatsByUserId.mockRejectedValue(new Error('Database error'));

      const { getChats } = await import('../../src/app/controllers/ai.controller.js');
      await getChats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get chat list.',
      });
    });
  });

  describe('getChatMessages', () => {
    it('should return 404 when chat not found', async () => {
      mockReq.params.chatId = 'nonexistent';
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatById.mockResolvedValue(null);

      const { getChatMessages } = await import('../../src/app/controllers/ai.controller.js');
      await getChatMessages(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Chat not found.',
      });
    });

    it('should return 404 when user does not own chat', async () => {
      mockReq.params.chatId = 'chat123';
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatById.mockResolvedValue({ userId: TEST_USERS.user2.id });
      chatService.userOwnsChat.mockReturnValue(false);

      const { getChatMessages } = await import('../../src/app/controllers/ai.controller.js');
      await getChatMessages(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return messages when chat exists and user owns it', async () => {
      mockReq.params.chatId = 'chat123';
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatById.mockResolvedValue({ userId: TEST_USERS.user1.id });
      chatService.userOwnsChat.mockReturnValue(true);
      chatService.getUserFacingMessages.mockResolvedValue([
        { _id: 'msg1', role: 'user', content: SAMPLE_CHAT_MESSAGES[0].content, createdAt: new Date() },
        { _id: 'msg2', role: 'assistant', content: SAMPLE_CHAT_MESSAGES[1].content, createdAt: new Date() },
      ]);

      const { getChatMessages } = await import('../../src/app/controllers/ai.controller.js');
      await getChatMessages(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ role: 'user' }),
          expect.objectContaining({ role: 'assistant' }),
        ]),
      });
    });

    it('should return empty array for chat with no messages', async () => {
      mockReq.params.chatId = 'chat123';
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatById.mockResolvedValue({ userId: TEST_USERS.user1.id });
      chatService.userOwnsChat.mockReturnValue(true);
      chatService.getUserFacingMessages.mockResolvedValue([]);

      const { getChatMessages } = await import('../../src/app/controllers/ai.controller.js');
      await getChatMessages(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it('should return 500 on service error', async () => {
      mockReq.params.chatId = 'chat123';
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatById.mockRejectedValue(new Error('Database error'));

      const { getChatMessages } = await import('../../src/app/controllers/ai.controller.js');
      await getChatMessages(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('deleteChatById', () => {
    it('should delete chat successfully', async () => {
      mockReq.params.chatId = 'chat123';
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.deleteChat.mockResolvedValue({ _id: 'chat123' });

      const { deleteChatById } = await import('../../src/app/controllers/ai.controller.js');
      await deleteChatById(mockReq, mockRes);

      expect(chatService.deleteChat).toHaveBeenCalledWith('chat123', TEST_USERS.user1.id);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Chat deleted successfully.',
      });
    });

    it('should return 404 when chat not found', async () => {
      mockReq.params.chatId = 'nonexistent';
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.deleteChat.mockResolvedValue(null);

      const { deleteChatById } = await import('../../src/app/controllers/ai.controller.js');
      await deleteChatById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Chat not found.',
      });
    });

    it('should return 500 on service error', async () => {
      mockReq.params.chatId = 'chat123';
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.deleteChat.mockRejectedValue(new Error('Database error'));

      const { deleteChatById } = await import('../../src/app/controllers/ai.controller.js');
      await deleteChatById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('streamChat', () => {
    // Helper to generate valid UUID v4
    const generateUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    it('should return 400 when messages array is empty', async () => {
      mockReq.params.chatId = generateUUID();
      mockReq.body = { messages: [] };

      const { streamChat } = await import('../../src/app/controllers/ai.controller.js');
      await streamChat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Messages cannot be empty.',
      });
    });

    it('should return 400 when chatId is not a valid UUID', async () => {
      mockReq.params.chatId = 'invalid-id';
      mockReq.body = { messages: [{ role: 'user', content: 'Hello' }] };

      const { streamChat } = await import('../../src/app/controllers/ai.controller.js');
      await streamChat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Valid chat ID (UUID) is required.',
      });
    });

    it('should return 404 when chat exists but user does not own it', async () => {
      const chatId = generateUUID();
      mockReq.params.chatId = chatId;
      mockReq.body = { messages: [{ role: 'user', content: 'Hello' }] };
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatById.mockResolvedValue({ userId: TEST_USERS.user2.id });
      chatService.userOwnsChat.mockReturnValue(false);

      const { streamChat } = await import('../../src/app/controllers/ai.controller.js');
      await streamChat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid chat session.',
      });
    });

    it('should create new chat when chat does not exist', async () => {
      const chatId = generateUUID();
      mockReq.params.chatId = chatId;
      mockReq.body = { messages: [{ role: 'user', content: 'Saya ingin membuat bisnis delivery' }] };
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatById.mockResolvedValue(null); // Chat doesn't exist
      chatService.createChat.mockResolvedValue({ _id: chatId });
      chatService.createMessage.mockResolvedValue({});

      const { streamChat } = await import('../../src/app/controllers/ai.controller.js');
      
      // The function will try to stream, which will fail in test environment
      // but we can verify createChat was called
      try {
        await streamChat(mockReq, mockRes);
      } catch (e) {
        // Expected to fail when trying to stream
      }

      expect(chatService.createChat).toHaveBeenCalledWith(
        chatId,
        TEST_USERS.user1.id,
        expect.any(String)
      );
    });
  });
});
