import { describe, it, expect } from 'vitest';
import {
  validateStreamChatRequest,
  streamChatRequestSchema,
} from '../../src/app/validations/ai.validation.js';

describe('AI Validation', () => {
  describe('validateStreamChatRequest', () => {
    it('should pass with valid message', () => {
      const result = validateStreamChatRequest({
        message: 'Hello, I want to create a business plan',
      });
      expect(result.success).toBe(true);
    });

    it('should pass with message and chatId', () => {
      const result = validateStreamChatRequest({
        message: 'Continue our conversation',
        chatId: '507f1f77bcf86cd799439011',
      });
      expect(result.success).toBe(true);
    });

    it('should fail with empty message', () => {
      const result = validateStreamChatRequest({
        message: '',
      });
      expect(result.success).toBe(false);
    });

    it('should fail without message', () => {
      const result = validateStreamChatRequest({});
      expect(result.success).toBe(false);
    });

    it('should fail with message exceeding max length', () => {
      const result = validateStreamChatRequest({
        message: 'a'.repeat(10001),
      });
      expect(result.success).toBe(false);
    });
  });
});
