const app = require('../app/index');
const path = require('path');

// --- 1. Load Router dan Pasang ke Objek 'app' ---
// Memuat dan memasang router diperlukan agar objek usersRouter terinisialisasi
// dan stack-nya siap diakses.
const usersRouter = require('../app/routes/users');
app.use('/api/v1/users', usersRouter);
// Tambahkan router lain di sini jika ada: app.use('/api/v1/posts', postsRouter);

// --- 2. Fungsi Pencetak Manual ---
function printRouteList(router, prefix) {
    console.log('----------------------------------------------------');
    console.log('         ✅ DAFTAR ENDPOINT KIVO API ✅');
    console.log('----------------------------------------------------');
    console.log('| METHOD   | PATH');
    console.log('----------------------------------------------------');

    router.stack.forEach(layer => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            // Prefix harus ditambahkan secara manual
            const routePath = prefix + layer.route.path; 
            console.log(`| ${methods.padEnd(8)} | ${routePath}`);
        }
    });

    console.log('----------------------------------------------------');
}


// --- 3. Eksekusi dan Keluar ---
// Kita hanya mencetak route dari usersRouter (metode yang terbukti stabil)
printRouteList(usersRouter, '/api/v1/users');

// Matikan proses karena ini adalah script utility dan harus keluar segera.
process.exit(0);