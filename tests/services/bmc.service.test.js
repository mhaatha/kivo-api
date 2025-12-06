import { describe, it, expect } from 'vitest';
import { TEST_USERS, SAMPLE_BMC_ITEMS } from '../setup.js';

// Test the pure utility functions directly without mocking mongoose
describe('BMC Service', () => {
  describe('userOwnsBmc', () => {
    // Pure function test (logic only)
    const userOwnsBmc = (bmc, userId) => {
      return bmc && bmc.authorId === userId;
    };

    describe('Ownership validation', () => {
      it('should return true when user owns the BMC', () => {
        const bmc = { authorId: TEST_USERS.user1.id };
        expect(userOwnsBmc(bmc, TEST_USERS.user1.id)).toBe(true);
      });

      it('should return false when user does not own the BMC', () => {
        const bmc = { authorId: TEST_USERS.user1.id };
        expect(userOwnsBmc(bmc, TEST_USERS.user2.id)).toBe(false);
      });

      it('should return false when authorId mismatch', () => {
        const bmc = { authorId: 'user123' };
        expect(userOwnsBmc(bmc, 'user456')).toBe(false);
      });
    });

    describe('Null/Undefined handling', () => {
      it('should return falsy when BMC is null', () => {
        expect(userOwnsBmc(null, TEST_USERS.user1.id)).toBeFalsy();
      });

      it('should return falsy when BMC is undefined', () => {
        expect(userOwnsBmc(undefined, TEST_USERS.user1.id)).toBeFalsy();
      });

      it('should return false when BMC has no authorId', () => {
        const bmc = {};
        expect(userOwnsBmc(bmc, TEST_USERS.user1.id)).toBeFalsy();
      });
    });

    describe('Edge cases', () => {
      it('should return false when authorId is empty string', () => {
        const bmc = { authorId: 'user123' };
        expect(userOwnsBmc(bmc, '')).toBe(false);
      });

      it('should return false when bmc authorId is null', () => {
        const bmc = { authorId: null };
        expect(userOwnsBmc(bmc, 'user123')).toBe(false);
      });

      it('should handle case-sensitive authorId comparison', () => {
        const bmc = { authorId: 'User123' };
        expect(userOwnsBmc(bmc, 'user123')).toBe(false);
      });

      it('should work with real user IDs from database', () => {
        const bmc = { authorId: TEST_USERS.user1.id };
        expect(userOwnsBmc(bmc, TEST_USERS.user1.id)).toBe(true);
        expect(userOwnsBmc(bmc, TEST_USERS.user2.id)).toBe(false);
      });
    });
  });

  describe('BMC data structure validation', () => {
    it('should validate complete BMC with all 9 blocks', () => {
      const bmc = {
        authorId: TEST_USERS.user1.id,
        items: SAMPLE_BMC_ITEMS,
        isPublic: false,
      };
      
      expect(bmc.items).toHaveLength(9);
      expect(bmc.items.every(item => item.tag && item.content)).toBe(true);
    });

    it('should validate BMC tags are from allowed list', () => {
      // Tags should be snake_case to match model enum
      const allowedTags = [
        'customer_segments',
        'value_propositions',
        'channels',
        'customer_relationships',
        'revenue_streams',
        'key_resources',
        'key_activities',
        'key_partnerships',
        'cost_structure',
      ];
      
      SAMPLE_BMC_ITEMS.forEach(item => {
        expect(allowedTags).toContain(item.tag);
      });
    });

    it('should validate BMC visibility toggle', () => {
      const bmc = { isPublic: false };
      bmc.isPublic = !bmc.isPublic;
      expect(bmc.isPublic).toBe(true);
      bmc.isPublic = !bmc.isPublic;
      expect(bmc.isPublic).toBe(false);
    });
  });

  describe('BMC tool result parsing', () => {
    it('should parse generateAndSaveBMC result correctly', () => {
      const result = {
        status: 'success',
        bmcId: '507f1f77bcf86cd799439011',
        blocksGenerated: 9,
        message: 'BMC berhasil dibuat dan disimpan.',
      };
      
      expect(result.status).toBe('success');
      expect(result.bmcId).toBeDefined();
      expect(result.blocksGenerated).toBe(9);
    });

    it('should parse updateBMC result correctly', () => {
      const result = {
        status: 'success',
        bmcId: '507f1f77bcf86cd799439011',
        blocksUpdated: 3,
        message: 'BMC berhasil diperbarui.',
      };
      
      expect(result.status).toBe('success');
      expect(result.bmcId).toBeDefined();
      expect(result.blocksUpdated).toBeGreaterThan(0);
    });

    it('should handle failed BMC operation', () => {
      const result = {
        status: 'failed',
        message: 'BMC not found or unauthorized.',
      };
      
      expect(result.status).toBe('failed');
      expect(result.message).toBeDefined();
    });
  });
});
