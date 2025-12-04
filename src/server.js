import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app/index.js';
// Routes from main branch
import databasesRouter from './app/routes/db.route.js';
import bmcRouteRouter from './app/routes/bmc.route.js';
import authRouter from './app/routes/auth.route.js';
import protectedRouter from './app/routes/protected.route.js';
// Routes from feat/ai-chat branch
import aiRouter from './app/routes/ai.js';
import bmcRouter from './app/routes/bmc.js';

// PORT env section
const port = process.env.PORT;

if (!port) {
  console.error('error: PORT environment variable is missing.');
  process.exit(1);
}

if (isNaN(port)) {
  console.error('error: PORT must be a number.');
  process.exit(1);
}

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('error: MONGODB_URI environment variable is missing.');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log(`📡 Database: ${mongoose.connection.name}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Routes from main branch
app.use('/api/v1/databases', databasesRouter);
app.use('/api/v1/bmc', bmcRouteRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/protected', protectedRouter);

// Routes from feat/ai-chat branch (AI Chat & BMC management)
app.use('/api/chat', aiRouter);
app.use('/api/chats', aiRouter);
app.use('/api/bmc', bmcRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
