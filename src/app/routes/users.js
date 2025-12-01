import { Router } from 'express';
import { greetUser } from '../controllers/users.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, greetUser);

export default router;
