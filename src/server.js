// src/server.js

// 1. Load .env file
const dotenv = require('dotenv');
dotenv.config();

// 2. Validasi dan Pengambilan PORT
const port = process.env.PORT || 3000;
const numericPort = parseInt(port, 10);

if (isNaN(numericPort) || numericPort <= 0) {
    console.error(`❌ Error: PORT '${port}' must be a valid positive number.`);
    process.exit(1);
}

// 3. Require App
const app = require('./app/index'); 

// 4. User routers
const usersRouter = require('./app/routes/users');
app.use('/api/v1/users', usersRouter);



// 5. Start Server (Hanya dijalankan jika PRINT_ROUTES BUKAN 'true')
app.listen(numericPort, () => {
    console.log(`✅ Server is running on port ${numericPort}`);
});