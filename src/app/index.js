import { clerkMiddleware } from '@clerk/express';
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
      process.env.WEB_URL || 'https://kivoai.netlify.app',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }),
);

app.use(clerkMiddleware());

app.use(express.json());

app.use(morgan('combined'));

app.use(helmet());

export default app;
