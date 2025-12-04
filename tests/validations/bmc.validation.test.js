import { describe, it, expect } from 'vitest';
import {
  validateBmcUpdate,
  validateBmcId,
} from '../../src/app/validations/bmc.validation.js';
import { BMC_TAGS, SAMPLE_BMC_ITEMS } from '../setup.js';

describe('BMC Validation', () => {
  describe('validateBmcUpdate', () => {
    // Valid cases
    describe('Valid inputs', () => {
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

      it('should pass with all 9 BMC blocks', () => {
        const result = validateBmcUpdate({
          items: SAMPLE_BMC_ITEMS,
        });
        expect(result.success).toBe(true);
        expect(result.data.items).toHaveLength(9);
      });

      it('should pass with duplicate tags (multiple entries per block)', () => {
        const result = validateBmcUpdate({
          items: [
            { tag: 'CustomerSegments', content: 'Young professionals' },
            { tag: 'CustomerSegments', content: 'Small businesses' },
          ],
        });
        expect(result.success).toBe(true);
      });

      it('should pass with long content', () => {
        const result = validateBmcUpdate({
          items: [
            { tag: 'ValuePropositions', content: 'Detailed value proposition: '.repeat(100) },
          ],
        });
        expect(result.success).toBe(true);
      });

      it('should pass with Indonesian content', () => {
        const result = validateBmcUpdate({
          items: [
            { tag: 'CustomerSegments', content: 'Anak muda usia 25-35 tahun di kota besar' },
            { tag: 'ValuePropositions', content: 'Pengiriman cepat dan murah' },
          ],
        });
        expect(result.success).toBe(true);
      });
    });

    // Test each BMC tag
    describe('All BMC tags validation', () => {
      BMC_TAGS.forEach((tag) => {
        it(`should pass with valid ${tag} tag`, () => {
          const result = validateBmcUpdate({
            items: [{ tag, content: `Test content for ${tag}` }],
          });
          expect(result.success).toBe(true);
        });
      });
    });

    // Invalid cases
    describe('Invalid inputs', () => {
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

      it('should fail with invalid item structure (missing content)', () => {
        const result = validateBmcUpdate({
          items: [{ tag: 'CustomerSegments' }],
        });
        expect(result.success).toBe(false);
      });

      it('should fail with invalid item structure (missing tag)', () => {
        const result = validateBmcUpdate({
          items: [{ content: 'Some content' }],
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

      it('should fail with null items', () => {
        const result = validateBmcUpdate({
          items: null,
        });
        expect(result.success).toBe(false);
      });

      it('should fail with string instead of array', () => {
        const result = validateBmcUpdate({
          items: 'not an array',
        });
        expect(result.success).toBe(false);
      });

      it('should pass with any tag name (not enum-validated in schema)', () => {
        // Note: Current schema doesn't validate tag enum, only checks min(1)
        const result = validateBmcUpdate({
          items: [{ tag: 'AnyTag', content: 'Some content' }],
        });
        expect(result.success).toBe(true);
      });

      it('should pass with whitespace-only content (not trimmed by schema)', () => {
        // Note: Current schema doesn't trim whitespace
        const result = validateBmcUpdate({
          items: [{ tag: 'CustomerSegments', content: '   ' }],
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('validateBmcId', () => {
    describe('Valid inputs', () => {
      it('should pass with valid MongoDB ObjectId', () => {
        const result = validateBmcId({ id: '507f1f77bcf86cd799439011' });
        expect(result.success).toBe(true);
      });

      it('should pass with another valid ObjectId', () => {
        const result = validateBmcId({ id: '5f5e5b5a5d5c5b5a5d5c5b5a' });
        expect(result.success).toBe(true);
      });
    });

    describe('Invalid inputs', () => {
      it('should fail with empty ID', () => {
        const result = validateBmcId({ id: '' });
        expect(result.success).toBe(false);
      });

      it('should fail without ID', () => {
        const result = validateBmcId({});
        expect(result.success).toBe(false);
      });

      it('should fail with null ID', () => {
        const result = validateBmcId({ id: null });
        expect(result.success).toBe(false);
      });

      it('should fail with undefined ID', () => {
        const result = validateBmcId({ id: undefined });
        expect(result.success).toBe(false);
      });

      it('should fail with number ID', () => {
        const result = validateBmcId({ id: 12345 });
        expect(result.success).toBe(false);
      });
    });
  });
});
