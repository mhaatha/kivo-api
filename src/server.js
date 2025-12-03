import 'dotenv/config';
import app from './app/index.js';
import databasesRouter from './app/routes/db.route.js';
import bmcRouter from './app/routes/bmc.route.js';

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

app.use('/api/v1/databases', databasesRouter);
app.use('/api/v1/bmc', bmcRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
});
