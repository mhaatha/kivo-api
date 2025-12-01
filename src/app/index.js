import express from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './utils/auth.js';

const app = express();

app.all('/api/v1/auth/*splat', toNodeHandler(auth));

// Middleware JSON parser
// It helps the app read JSON data sent from the client
// and makes it available in req.body
//
// Don’t use express.json() before the Better Auth handler.
// Use it only for other routes, or the client API will get stuck on "pending".
app.use(express.json());

export default app;
