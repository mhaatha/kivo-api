import { clerkClient, clerkMiddleware, getAuth, requireAuth } from '@clerk/express';
import { verifyWebhook } from '@clerk/express/webhooks';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import User from './models/user.model.js';

const app = express();

app.set('trust proxy', 1);

// Configure CORS middleware
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL1,
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);


app.use(clerkMiddleware())

app.use(express.json());

app.use(morgan('combined'));

app.use(helmet());

// test protected route
app.get('/api/v1/protected', requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { userId } = getAuth(req)

  // Use Clerk's JavaScript Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId)

  return res.json({ user })
})


app.post('/api/v1/auth/webhooks', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const evt = await verifyWebhook(req)

    const eventType = evt.type
    console.log(`Received webhook with event type: ${eventType}`)

    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data
      const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id)

      await User.create({
        _id: id,
        name: [first_name, last_name].filter(Boolean).join(' ') || 'User',
        email: primaryEmail?.email_address,
        emailVerified: primaryEmail?.verification?.status === 'verified',
        image: image_url || null,
      })

      console.log(`User created: ${id}`)
    }

    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data
      const primaryEmail = email_addresses?.find(e => e.id === evt.data.primary_email_address_id)

      await User.findByIdAndUpdate(id, {
        name: [first_name, last_name].filter(Boolean).join(' ') || 'User',
        email: primaryEmail?.email_address,
        emailVerified: primaryEmail?.verification?.status === 'verified',
        image: image_url || null,
      }, { upsert: true, new: true })

      console.log(`User updated: ${id}`)
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data

      await User.findByIdAndDelete(id)

      console.log(`User deleted: ${id}`)
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Error processing webhook:', err)
    return res.status(400).json({ error: 'Error processing webhook' })
  }
})

export default app;
