import { describe, it, expect } from 'vitest';
import { TEST_USERS } from '../setup.js';

// Test the pure utility functions directly without mocking mongoose
describe('Chat Service', () => {
  describe('userOwnsChat', () => {
    // Pure function test (logic only)
    const userOwnsChat = (chat, userId) => {
      return chat && chat.userId === userId;
    };

    describe('Ownership validation', () => {
      it('should return true when user owns the chat', () => {
        const chat = { userId: TEST_USERS.user1.id };
        expect(userOwnsChat(chat, TEST_USERS.user1.id)).toBe(true);
      });

      it('should return false when user does not own the chat', () => {
        const chat = { userId: TEST_USERS.user1.id };
        expect(userOwnsChat(chat, TEST_USERS.user2.id)).toBe(false);
      });

      it('should return false when userId mismatch', () => {
        const chat = { userId: 'user123' };
        expect(userOwnsChat(chat, 'user456')).toBe(false);
      });
    });

    describe('Null/Undefined handling', () => {
      it('should return falsy when chat is null', () => {
        expect(userOwnsChat(null, TEST_USERS.user1.id)).toBeFalsy();
      });

      it('should return falsy when chat is undefined', () => {
        expect(userOwnsChat(undefined, TEST_USERS.user1.id)).toBeFalsy();
      });

      it('should return false when chat has no userId', () => {
        const chat = {};
        expect(userOwnsChat(chat, TEST_USERS.user1.id)).toBeFalsy();
      });
    });

    describe('Edge cases', () => {
      it('should return false when userId is empty string', () => {
        const chat = { userId: 'user123' };
        expect(userOwnsChat(chat, '')).toBe(false);
      });

      it('should return false when chat userId is null', () => {
        const chat = { userId: null };
        expect(userOwnsChat(chat, 'user123')).toBe(false);
      });

      it('should handle case-sensitive userId comparison', () => {
        const chat = { userId: 'User123' };
        expect(userOwnsChat(chat, 'user123')).toBe(false);
      });

      it('should work with real user IDs from database', () => {
        const chat = { userId: TEST_USERS.user1.id };
        expect(userOwnsChat(chat, TEST_USERS.user1.id)).toBe(true);
        expect(userOwnsChat(chat, TEST_USERS.user2.id)).toBe(false);
      });
    });
  });

  describe('buildAIMessageHistory logic', () => {
    // Test the message filtering logic
    const filterMessages = (messages) => {
      return messages
        .filter((msg) => ['user', 'assistant', 'tool'].includes(msg.role))
        .map((msg) => {
          if (msg.role === 'tool') {
            if (!msg.tool_call_id) return null;
            return { role: 'tool', content: msg.content, tool_call_id: msg.tool_call_id };
          }
          if (msg.role === 'assistant') {
            const hasTool = msg.tool_calls && msg.tool_calls.length > 0;
            const hasContent = msg.content && msg.content.trim().length > 0;
            if (!hasTool && !hasContent) return null;
            const m = { role: 'assistant' };
            if (hasTool) m.tool_calls = msg.tool_calls;
            if (hasContent) m.content = msg.content;
            return m;
          }
          if (msg.role === 'user') {
            return { role: 'user', content: msg.content };
          }
          return null;
        })
        .filter((msg) => msg !== null);
    };

    it('should filter user messages correctly', () => {
      const messages = [
        { role: 'user', content: 'Hello' },
        { role: 'user', content: 'How are you?' },
      ];
      const result = filterMessages(messages);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ role: 'user', content: 'Hello' });
    });

    it('should filter assistant messages correctly', () => {
      const messages = [
        { role: 'assistant', content: 'Hi there!', tool_calls: null },
      ];
      const result = filterMessages(messages);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ role: 'assistant', content: 'Hi there!' });
    });

    it('should include assistant with tool_calls', () => {
      const messages = [
        { role: 'assistant', content: '', tool_calls: [{ id: 'call_1' }] },
      ];
      const result = filterMessages(messages);
      expect(result).toHaveLength(1);
      expect(result[0].tool_calls).toBeDefined();
    });

    it('should filter out empty assistant messages', () => {
      const messages = [
        { role: 'assistant', content: '', tool_calls: [] },
        { role: 'assistant', content: '   ', tool_calls: null },
      ];
      const result = filterMessages(messages);
      expect(result).toHaveLength(0);
    });

    it('should filter tool messages with tool_call_id', () => {
      const messages = [
        { role: 'tool', content: '{"status":"success"}', tool_call_id: 'call_1' },
      ];
      const result = filterMessages(messages);
      expect(result).toHaveLength(1);
      expect(result[0].tool_call_id).toBe('call_1');
    });

    it('should exclude tool messages without tool_call_id', () => {
      const messages = [
        { role: 'tool', content: '{"status":"success"}' },
      ];
      const result = filterMessages(messages);
      expect(result).toHaveLength(0);
    });

    it('should exclude system messages', () => {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant' },
        { role: 'user', content: 'Hello' },
      ];
      const result = filterMessages(messages);
      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('user');
    });
  });
});
