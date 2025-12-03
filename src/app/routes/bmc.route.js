import { Router } from 'express';
import { getAllBMCs } from '../controllers/bmc.controller.js';

const router = Router();

router.get('/', getAllBMCs);

export default router;
