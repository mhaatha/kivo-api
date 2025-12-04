import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TEST_USERS, SAMPLE_CHAT_MESSAGES } from '../setup.js';

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
    it('should return 400 when validation fails', async () => {
      mockReq.body = { message: '' };
      
      const validation = await import('../../src/app/validations/ai.validation.js');
      validation.validateStreamChatRequest.mockReturnValue({
        success: false,
        error: { errors: [{ message: 'Message cannot be empty' }] },
      });

      const { streamChat } = await import('../../src/app/controllers/ai.controller.js');
      await streamChat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Message cannot be empty.',
        details: expect.any(Array),
      });
    });

    it('should return 404 when chatId provided but not found', async () => {
      mockReq.body = { message: 'Hello', chatId: 'nonexistent' };
      
      const validation = await import('../../src/app/validations/ai.validation.js');
      validation.validateStreamChatRequest.mockReturnValue({ success: true });
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatById.mockResolvedValue(null);

      const { streamChat } = await import('../../src/app/controllers/ai.controller.js');
      await streamChat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid chat session.',
      });
    });

    it('should return 404 when chatId provided but user does not own it', async () => {
      mockReq.body = { message: 'Hello', chatId: 'chat123' };
      
      const validation = await import('../../src/app/validations/ai.validation.js');
      validation.validateStreamChatRequest.mockReturnValue({ success: true });
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatById.mockResolvedValue({ userId: TEST_USERS.user2.id });
      chatService.userOwnsChat.mockReturnValue(false);

      const { streamChat } = await import('../../src/app/controllers/ai.controller.js');
      await streamChat(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should create new chat when no chatId provided', async () => {
      mockReq.body = { message: 'Saya ingin membuat bisnis delivery' };
      
      const validation = await import('../../src/app/validations/ai.validation.js');
      validation.validateStreamChatRequest.mockReturnValue({ success: true });
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.createChat.mockResolvedValue({ _id: 'newChat123' });
      chatService.createMessage.mockResolvedValue({});
      
      const aiService = await import('../../src/app/services/ai.service.js');
      // Mock streaming response
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield { choices: [{ delta: { content: 'Hello' } }] };
          yield { choices: [{ delta: { content: ' there!' } }] };
        },
      };
      aiService.getChatCompletion.mockResolvedValue({
        choices: [{ message: { content: 'Test response', tool_calls: null } }],
      });
      aiService.getStreamingCompletion.mockResolvedValue(mockStream);

      const { streamChat } = await import('../../src/app/controllers/ai.controller.js');
      await streamChat(mockReq, mockRes);

      expect(chatService.createChat).toHaveBeenCalledWith(
        TEST_USERS.user1.id,
        expect.any(String)
      );
    });
  });
});
