import { Router } from 'express';
import { getPublicBmcPosts, getBmcById } from '../controllers/bmc.controller.js';

const router = Router();

router.get('/', getPublicBmcPosts);
router.get('/:id', getBmcById);

export default router;
