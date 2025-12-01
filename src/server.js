// Load .env file
const dotenv = require('dotenv');
dotenv.config();

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

// Require app
const app = require('./app');

// User routers
const usersRouter = require('./app/routes/users');
app.use('/api/v1/users', usersRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
