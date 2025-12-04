import { describe, it, expect } from 'vitest';
import {
  validateBmcUpdate,
  validateBmcId,
} from '../../src/app/validations/bmc.validation.js';

describe('BMC Validation', () => {
  describe('validateBmcUpdate', () => {
    it('should pass with valid BMC items', () => {
      const result = validateBmcUpdate({
        items: [
          { tag: 'CustomerSegments', content: 'Young professionals aged 25-35' },
          { tag: 'ValuePropositions', content: 'Fast and affordable delivery' },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should pass with single item', () => {
      const result = validateBmcUpdate({
        items: [{ tag: 'CustomerSegments', content: 'Startups' }],
      });
      expect(result.success).toBe(true);
    });

    it('should fail with empty items array', () => {
      const result = validateBmcUpdate({
        items: [],
      });
      expect(result.success).toBe(false);
    });

    it('should fail without items', () => {
      const result = validateBmcUpdate({});
      expect(result.success).toBe(false);
    });

    it('should fail with invalid item structure', () => {
      const result = validateBmcUpdate({
        items: [{ tag: 'CustomerSegments' }], // missing content
      });
      expect(result.success).toBe(false);
    });

    it('should fail with empty tag', () => {
      const result = validateBmcUpdate({
        items: [{ tag: '', content: 'Some content' }],
      });
      expect(result.success).toBe(false);
    });

    it('should fail with empty content', () => {
      const result = validateBmcUpdate({
        items: [{ tag: 'CustomerSegments', content: '' }],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('validateBmcId', () => {
    it('should pass with valid ID', () => {
      const result = validateBmcId({ id: '507f1f77bcf86cd799439011' });
      expect(result.success).toBe(true);
    });

    it('should fail with empty ID', () => {
      const result = validateBmcId({ id: '' });
      expect(result.success).toBe(false);
    });

    it('should fail without ID', () => {
      const result = validateBmcId({});
      expect(result.success).toBe(false);
    });
  });
});
