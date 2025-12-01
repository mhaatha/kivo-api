// src/app/routes/users.js
const router = require('express').Router();
const path = require('path'); 

// 1. Dapatkan jalur absolut yang teruji benar
const controllersPath = path.resolve(__dirname, '..', 'controllers', 'users');

try {
    // 2. Import SELURUH OBJECT yang diexport oleh controllers/users.js
    const userController = require(controllersPath);
    
    // 3. Daftarkan route menggunakan properti dari object yang di-import
    // Ini lebih stabil daripada destructuring ({ greetUser })
    router.get('/', userController.greetUser); 
    router.get('/login', userController.greetLogin); 

    console.log('Router: Route / berhasil didaftarkan.'); // DEBUGGING
    
} catch (error) {
    console.error(`Router ERROR: Gagal mendaftarkan /api/v1/users. Detail: ${error.message}`);
}

module.exports = router;