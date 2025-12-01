import { auth } from '../utils/auth.js';
import { fromNodeHeaders } from 'better-auth/node';

export const requireAuth = async (req, res, next) => {
  try {
    // Get session from the request header
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    // Check if the session exists
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Please login first.',
      });
    }

    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    console.error('Auth Error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
