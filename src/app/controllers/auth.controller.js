import { verifyWebhook } from '@clerk/express/webhooks';
import User from './models/user.model.js';

export const authController = {
  async handleAuthWebhook(req, res) {
    try {
      const evt = await verifyWebhook(req);

      const eventType = evt.type;
      console.log(`Received webhook with event type: ${eventType}`);

      if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name, image_url } =
          evt.data;
        const primaryEmail = email_addresses?.find(
          (e) => e.id === evt.data.primary_email_address_id,
        );

        await User.create({
          _id: id,
          name: [first_name, last_name].filter(Boolean).join(' ') || 'User',
          email: primaryEmail?.email_address,
          emailVerified: primaryEmail?.verification?.status === 'verified',
          image: image_url || null,
        });

        console.log(`User created: ${id}`);
      }

      if (eventType === 'user.updated') {
        const { id, email_addresses, first_name, last_name, image_url } =
          evt.data;
        const primaryEmail = email_addresses?.find(
          (e) => e.id === evt.data.primary_email_address_id,
        );

        await User.findByIdAndUpdate(
          id,
          {
            name: [first_name, last_name].filter(Boolean).join(' ') || 'User',
            email: primaryEmail?.email_address,
            emailVerified: primaryEmail?.verification?.status === 'verified',
            image: image_url || null,
          },
          { upsert: true, new: true },
        );

        console.log(`User updated: ${id}`);
      }

      if (eventType === 'user.deleted') {
        const { id } = evt.data;

        await User.findByIdAndDelete(id);

        console.log(`User deleted: ${id}`);
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('Error processing webhook:', err);
      return res.status(400).json({ error: 'Error processing webhook' });
    }
  },
};
