import express from 'express';

const app = express();

// Middleware JSON parser
// It helps the app read JSON data sent from the client
// and makes it available in req.body
app.use(express.json());

export default app;
