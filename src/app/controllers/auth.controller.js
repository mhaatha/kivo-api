import { verifyWebhook } from '@clerk/express/webhooks';
import * as authService from '../services/auth.service.js';

export const authController = {
  async handleAuthWebhook(req, res) {
    try {
      const evt = await verifyWebhook(req);

      const eventType = evt.type;
      console.log(`Received webhook with event type: ${eventType}`);

      if (eventType === 'user.created') {
        await authService.handleUserCreated(evt.data);
        console.log(`User created: ${evt.data.id}`);
      }

      if (eventType === 'user.updated') {
        await authService.handleUserUpdated(evt.data);
        console.log(`User updated: ${evt.data.id}`);
      }

      if (eventType === 'user.deleted') {
        await authService.handleUserDeleted(evt.data.id);
        console.log(`User deleted: ${evt.data.id}`);
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error processing webhook:', err);
      return res.status(400).json({ error: 'Error processing webhook' });
    }
  },
};
