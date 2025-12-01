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

// --- KODE PENCETAKAN TERTANAM (FINAL STABLE VERSION) ---

if (process.env.PRINT_ROUTES === 'true') {
    console.log('----------------------------------------------------');
    console.log('         ✅ DAFTAR ENDPOINT KIVO API ✅');
    console.log('----------------------------------------------------');
    console.log('| METHOD   | PATH');
    console.log('----------------------------------------------------');

    // Karena app._router.stack bermasalah, kita looping LANGSUNG pada usersRouter
    usersRouter.stack.forEach(layer => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            // Prefix harus ditambahkan secara manual
            const path = '/api/v1/users' + layer.route.path; 
            console.log(`| ${methods.padEnd(8)} | ${path}`);
        }
    });

    console.log('----------------------------------------------------');
    
    // Matikan proses secara paksa agar tidak menjalankan server
    setTimeout(() => {
        console.log("Proses pencetakan route selesai. Mematikan server.");
        process.exit(0); 
    }, 500); // Delay singkat untuk memastikan output tercetak
}

// 5. Start Server (Hanya dijalankan jika PRINT_ROUTES BUKAN 'true')
app.listen(numericPort, () => {
    console.log(`✅ Server is running on port ${numericPort}`);
});