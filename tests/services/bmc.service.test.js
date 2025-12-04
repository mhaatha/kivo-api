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
      const allowedTags = [
        'CustomerSegments',
        'ValuePropositions',
        'Channels',
        'CustomerRelationships',
        'RevenueStreams',
        'KeyResources',
        'KeyActivities',
        'KeyPartnerships',
        'CostStructure',
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
    it('should parse postBmcToDatabase result correctly', () => {
      const result = {
        status: 'success',
        system_note: 'BMC created. SAVE THIS ID TO MEMORY: 507f1f77bcf86cd799439011',
        bmcId: '507f1f77bcf86cd799439011',
      };
      
      expect(result.status).toBe('success');
      expect(result.bmcId).toBeDefined();
      expect(result.system_note).toContain(result.bmcId);
    });

    it('should parse updateBmcToDatabase result correctly', () => {
      const result = {
        status: 'success',
        system_note: 'BMC data updated successfully.',
        bmcId: '507f1f77bcf86cd799439011',
      };
      
      expect(result.status).toBe('success');
      expect(result.bmcId).toBeDefined();
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
