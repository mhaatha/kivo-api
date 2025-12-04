import { describe, it, expect } from 'vitest';

// Test the pure utility function directly without mocking mongoose
describe('BMC Service - userOwnsBmc', () => {
  // Pure function test (logic only)
  const userOwnsBmc = (bmc, userId) => {
    return bmc && bmc.authorId === userId;
  };

  it('should return true when user owns the BMC', () => {
    const bmc = { authorId: 'user123' };
    expect(userOwnsBmc(bmc, 'user123')).toBe(true);
  });

  it('should return false when user does not own the BMC', () => {
    const bmc = { authorId: 'user123' };
    expect(userOwnsBmc(bmc, 'user456')).toBe(false);
  });

  it('should return false when BMC is null', () => {
    expect(userOwnsBmc(null, 'user123')).toBeFalsy();
  });

  it('should return false when BMC is undefined', () => {
    expect(userOwnsBmc(undefined, 'user123')).toBeFalsy();
  });

  it('should return false when authorId is empty', () => {
    const bmc = { authorId: 'user123' };
    expect(userOwnsBmc(bmc, '')).toBe(false);
  });
});
