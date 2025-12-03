import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './utils/auth.js';
import morgan from 'morgan';
import helmet from 'helmet';

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

app.use(
  session({
    secret: process.env.BETTER_AUTH_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 15,
    },
  }),
);

// Mount Better Auth handler
app.all('/api/v1/auth/*splat', toNodeHandler(auth));

// Middleware JSON parser
// It helps the app read JSON data sent from the client
// and makes it available in req.body
//
// Don’t use express.json() before the Better Auth handler.
// Use it only for other routes, or the client API will get stuck on "pending".
app.use(express.json());

app.use(morgan('combined'));

app.use(helmet());

export default app;
