import { Router } from 'express';
import { greetUser } from '../controllers/users.js';

const router = Router();

router.get('/', greetUser);

export default router;
