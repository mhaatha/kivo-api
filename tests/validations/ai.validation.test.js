import { describe, it, expect } from 'vitest';
import {
  validateStreamChatRequest,
} from '../../src/app/validations/ai.validation.js';

describe('AI Validation', () => {
  describe('validateStreamChatRequest', () => {
    // Valid cases
    describe('Valid inputs', () => {
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
        expect(result.data).toHaveProperty('message');
        expect(result.data).toHaveProperty('chatId');
      });

      it('should pass with minimum length message (1 char)', () => {
        const result = validateStreamChatRequest({
          message: 'H',
        });
        expect(result.success).toBe(true);
      });

      it('should pass with message at max length (10000 chars)', () => {
        const result = validateStreamChatRequest({
          message: 'a'.repeat(10000),
        });
        expect(result.success).toBe(true);
      });

      it('should pass with BMC-related business message', () => {
        const result = validateStreamChatRequest({
          message: 'Saya ingin membuat bisnis delivery makanan untuk anak muda usia 25-35 tahun',
        });
        expect(result.success).toBe(true);
      });

      it('should pass with Indonesian language message', () => {
        const result = validateStreamChatRequest({
          message: 'Tolong bantu saya menyusun Business Model Canvas untuk startup teknologi',
        });
        expect(result.success).toBe(true);
      });

      it('should pass with message containing special characters', () => {
        const result = validateStreamChatRequest({
          message: 'Target pasar: 25-35 tahun, revenue: $10k/month, partnership dengan GoFood & GrabFood',
        });
        expect(result.success).toBe(true);
      });

      it('should pass with multiline message', () => {
        const result = validateStreamChatRequest({
          message: 'Line 1\nLine 2\nLine 3',
        });
        expect(result.success).toBe(true);
      });
    });

    // Invalid cases
    describe('Invalid inputs', () => {
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

      it('should fail with null message', () => {
        const result = validateStreamChatRequest({
          message: null,
        });
        expect(result.success).toBe(false);
      });

      it('should fail with undefined message', () => {
        const result = validateStreamChatRequest({
          message: undefined,
        });
        expect(result.success).toBe(false);
      });

      it('should fail with message exceeding max length (10001 chars)', () => {
        const result = validateStreamChatRequest({
          message: 'a'.repeat(10001),
        });
        expect(result.success).toBe(false);
      });

      it('should pass with whitespace-only message (not trimmed by schema)', () => {
        // Note: Current schema doesn't trim whitespace
        const result = validateStreamChatRequest({
          message: '   ',
        });
        expect(result.success).toBe(true);
      });

      it('should fail with number as message', () => {
        const result = validateStreamChatRequest({
          message: 12345,
        });
        expect(result.success).toBe(false);
      });

      it('should fail with array as message', () => {
        const result = validateStreamChatRequest({
          message: ['hello', 'world'],
        });
        expect(result.success).toBe(false);
      });

      it('should fail with object as message', () => {
        const result = validateStreamChatRequest({
          message: { text: 'hello' },
        });
        expect(result.success).toBe(false);
      });
    });

    // Edge cases
    describe('Edge cases', () => {
      it('should handle emoji in message', () => {
        const result = validateStreamChatRequest({
          message: 'Hello 👋 I want to start a business 🚀',
        });
        expect(result.success).toBe(true);
      });

      it('should handle unicode characters', () => {
        const result = validateStreamChatRequest({
          message: '日本語でも大丈夫ですか？',
        });
        expect(result.success).toBe(true);
      });

      it('should handle HTML-like content (stored as string)', () => {
        const result = validateStreamChatRequest({
          message: '<script>alert("test")</script>',
        });
        expect(result.success).toBe(true);
      });
    });
  });
});
