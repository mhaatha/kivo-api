import { clerkClient, clerkMiddleware, getAuth, requireAuth } from '@clerk/express';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

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

export default app;
