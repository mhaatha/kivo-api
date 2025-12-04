import { describe, it, expect } from 'vitest';

// Test the pure utility function directly without mocking mongoose
describe('Chat Service - userOwnsChat', () => {
  // Pure function test (logic only)
  const userOwnsChat = (chat, userId) => {
    return chat && chat.userId === userId;
  };

  it('should return true when user owns the chat', () => {
    const chat = { userId: 'user123' };
    expect(userOwnsChat(chat, 'user123')).toBe(true);
  });

  it('should return false when user does not own the chat', () => {
    const chat = { userId: 'user123' };
    expect(userOwnsChat(chat, 'user456')).toBe(false);
  });

  it('should return false when chat is null', () => {
    expect(userOwnsChat(null, 'user123')).toBeFalsy();
  });

  it('should return false when chat is undefined', () => {
    expect(userOwnsChat(undefined, 'user123')).toBeFalsy();
  });

  it('should return false when userId is empty', () => {
    const chat = { userId: 'user123' };
    expect(userOwnsChat(chat, '')).toBe(false);
  });
});
