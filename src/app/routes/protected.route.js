import { Router } from 'express';
import { protectedController } from '../controllers/protected.controller.js';
import { requireAuth } from '@clerk/express';

const router = Router();

router.get('/', requireAuth(), protectedController.getAuthenticatedUser);

export default router;
