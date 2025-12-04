import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import {
  getPublicBmcPosts,
  getBmcById,
  getMyBmcPosts,
  createBmc,
  updateBmc,
  deleteBmc,
  toggleVisibility,
} from '../controllers/bmc.controller.js';

const router = Router();

// GET /api/bmc/public - Get all public BMC posts (no auth required)
router.get('/public', getPublicBmcPosts);

// GET /api/bmc/my - Get all BMCs for current user
router.get('/my', requireAuth, getMyBmcPosts);

// GET /api/bmc/:id - Get BMC by ID
router.get('/:id', getBmcById);

// POST /api/bmc - Create new BMC
router.post('/', requireAuth, createBmc);

// PUT /api/bmc/:id - Update BMC
router.put('/:id', requireAuth, updateBmc);

// PATCH /api/bmc/:id/visibility - Toggle BMC visibility
router.patch('/:id/visibility', requireAuth, toggleVisibility);

// DELETE /api/bmc/:id - Delete BMC
router.delete('/:id', requireAuth, deleteBmc);

export default router;
