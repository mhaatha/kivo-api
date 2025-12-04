import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app/index.js';
import usersRouter from './app/routes/users.js';
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

// Routes
app.use('/api/v1/users', usersRouter);
app.use('/api/chat', aiRouter);
app.use('/api/chats', aiRouter);
app.use('/api/bmc', bmcRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
