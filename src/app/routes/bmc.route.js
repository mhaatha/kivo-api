import { Router } from 'express';
import { bmcController } from '../controllers/bmc.controller.js';

const router = Router();

router.get('/', bmcController.getAllBMCs);
router.get('/:id', bmcController.getBMCById);

export default router;
