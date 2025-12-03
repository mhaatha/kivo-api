import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import express from 'express';

const router = Router();

router.post(
  '/webhooks',
  express.raw({ type: 'application/json' }),
  authController.handleAuthWebhook,
);

export default router;
