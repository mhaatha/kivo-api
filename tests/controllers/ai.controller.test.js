import { describe, it, expect, vi, beforeEach } from 'vitest';

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
      user: { id: 'user123' },
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

  describe('getChats', () => {
    it('should return empty array when user has no chats', async () => {
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatsByUserId.mockResolvedValue([]);

      const { getChats } = await import('../../src/app/controllers/ai.controller.js');
      await getChats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it('should return list of chats', async () => {
      const chatService = await import('../../src/app/services/chat.service.js');
      const mockChats = [
        { _id: 'chat1', title: 'Chat 1', createdAt: new Date(), updatedAt: new Date() },
        { _id: 'chat2', title: 'Chat 2', createdAt: new Date(), updatedAt: new Date() },
      ];
      chatService.getChatsByUserId.mockResolvedValue(mockChats);

      const { getChats } = await import('../../src/app/controllers/ai.controller.js');
      await getChats(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'chat1', title: 'Chat 1' }),
          expect.objectContaining({ id: 'chat2', title: 'Chat 2' }),
        ]),
      });
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
      chatService.getChatById.mockResolvedValue({ userId: 'otherUser' });
      chatService.userOwnsChat.mockReturnValue(false);

      const { getChatMessages } = await import('../../src/app/controllers/ai.controller.js');
      await getChatMessages(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return messages when chat exists', async () => {
      mockReq.params.chatId = 'chat123';
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.getChatById.mockResolvedValue({ userId: 'user123' });
      chatService.userOwnsChat.mockReturnValue(true);
      chatService.getUserFacingMessages.mockResolvedValue([
        { _id: 'msg1', role: 'user', content: 'Hello', createdAt: new Date() },
        { _id: 'msg2', role: 'assistant', content: 'Hi there!', createdAt: new Date() },
      ]);

      const { getChatMessages } = await import('../../src/app/controllers/ai.controller.js');
      await getChatMessages(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({ role: 'user', content: 'Hello' }),
          expect.objectContaining({ role: 'assistant', content: 'Hi there!' }),
        ]),
      });
    });
  });

  describe('deleteChatById', () => {
    it('should delete chat successfully', async () => {
      mockReq.params.chatId = 'chat123';
      
      const chatService = await import('../../src/app/services/chat.service.js');
      chatService.deleteChat.mockResolvedValue({ _id: 'chat123' });

      const { deleteChatById } = await import('../../src/app/controllers/ai.controller.js');
      await deleteChatById(mockReq, mockRes);

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
  });
});
