import { Router } from 'express';
import { checkDBHealth } from '../controllers/db.controller.js';

const router = Router();

router.get('/health', checkDBHealth);

export default router;
