// Sederetkan semua endpoint yang tersedia berdasarkan konfigurasi server.js
// dan spesifikasi OpenAPI yang sebenarnya

function printRouteList() {
  const routes = [
    // AI Chat Endpoints (Updated to /api/v1/)
    { method: 'POST', path: '/api/v1/chat', description: 'Stream chat dengan AI assistant' },
    { method: 'POST', path: '/api/v1/chat/:chatId', description: 'Continue chat dengan chatId tertentu' },
    { method: 'GET', path: '/api/v1/chats', description: 'Get semua chat untuk user yang sedang login' },
    { method: 'GET', path: '/api/v1/chat/:chatId/messages', description: 'Get pesan untuk chat tertentu' },
    { method: 'DELETE', path: '/api/v1/chat/:chatId', description: 'Delete chat' },
    
    // BMC Endpoints (Updated to /api/v1/)
    { method: 'POST', path: '/api/v1/bmc-all', description: 'Create Business Model Canvas baru' },
    { method: 'GET', path: '/api/v1/bmc-all/public', description: 'Get semua publik BMC posts (no auth)' },
    { method: 'GET', path: '/api/v1/bmc-all/my', description: 'Get BMC milik user yang sedang login' },
    { method: 'GET', path: '/api/v1/bmc-all/:id', description: 'Get BMC berdasarkan ID' },
    { method: 'PUT', path: '/api/v1/bmc-all/:id', description: 'Update BMC tertentu' },
    { method: 'PATCH', path: '/api/v1/bmc-all/:id/visibility', description: 'Toggle public/private visibility' },
    { method: 'DELETE', path: '/api/v1/bmc-all/:id', description: 'Delete BMC tertentu' },
    
    // Database Endpoints
    { method: 'GET', path: '/api/v1/databases', description: 'Database management' },
    
    // Users Endpoints
    { method: 'GET', path: '/api/v1/users', description: 'Greet authenticated user' },
    
    // Auth Endpoints
    { method: 'POST', path: '/api/v1/auth/webhooks', description: 'Authentication webhooks' },
    
    // Protected Endpoints  
    { method: 'GET', path: '/api/v1/protected', description: 'Protected test endpoints' }
  ];

  console.log('====================================================================');
  console.log('                     DAFTAR ENDPOINT KIVO API');
  console.log('====================================================================');
  console.log('| METHOD   | PATH                                    | DESKRIPSI');
  console.log('====================================================================');

  routes.forEach((route) => {
    const methodStr = route.method.padEnd(8);
    const pathStr = route.path.padEnd(39);
    const descStr = route.description;
    
    console.log(`| ${methodStr} | ${pathStr} | ${descStr}`);
  });

  console.log('====================================================================');
  console.log(`Total endpoints: ${routes.length}`);

  // Informasi tambahan
  console.log('\n✧ Status Authentication:');
  console.log('  • /api/v1/databases, /api/v1/protected, /api/v1/users  : Require auth');
  console.log('  • /api/v1/bmc-all/my, /api/v1/bmc-all/*              : Require auth');
  console.log('  • /api/v1/chat, /api/v1/chats, /api/v1/chat/*          : Require auth');
  console.log('  • /api/v1/bmc-all/public, /api/auth/webhooks         : No auth required');
  console.log('  • /api/v1/auth/webhooks                                : Special webhook (raw body)');
  
  console.log('\n✧ Fitur Utama API:');
  console.log('  • Chat AI     : Real-time AI assistant untuk Business Model Canvas');
  console.log('  • Management BMC: CRUD operations untuk BMC');
  console.log('  • Users       : User management dan authentication');
  
  console.log('\n✧ Spesifikasi Teknis:');
  console.log('  • Streaming   : Server-Sent Events (SSE) untuk chat AI');
  console.log('  • Auth        : Better Auth (Bearer token)');
  console.log('  • Data Format : JSON');
  console.log('  • IDs         : MongoDB ObjectId format');
}

// Eksekusi fungsi
printRouteList();

// Keluar dari proses
process.exit(0);