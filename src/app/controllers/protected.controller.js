import { getAuth } from '@clerk/express';
import * as protectedService from '../services/protected.service.js';

export const protectedController = {
  async getAuthenticatedUser(req, res) {
    const { userId } = getAuth(req);

    try {
      const user = await protectedService.getAuthenticatedUser(userId);
      return res.json({ user });
    } catch (error) {
      console.error('Get Authenticated User Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get user information.',
      });
    }
  },
};
