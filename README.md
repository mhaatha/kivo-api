<br />
<div align="center">
  <a href="https://github.com/manikandareas/kivo-web">
  <img src="https://raw.githubusercontent.com/manikandareas/kivo-web/main/public/kivo-kuning-panjang.png" alt="Logo Project" width="200" />
</a>

  <p align="center">
    <h2>Menciptakan strategi untuk bisnismu!</h2>
    <br />
    <a href="#live-demo"><strong>Watch Demo »</strong></a>
    <br />
    <br />
    <a href="#about">About</a>
    |
    <a href="#how-to-run">How to Run</a>
  </p>
</div>

<div align="center">
    <img src="https://img.shields.io/badge/javascript-yellow?style=for-the-badge&logo=javascript&logoColor=white" alt="JavaScript">
    <img src="https://img.shields.io/badge/nodejs-%23339933.svg?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
    <img src="https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
    <img src="https://img.shields.io/badge/mongodb-%2347A248.svg?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
    <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
    <img src="https://img.shields.io/badge/openai-%23412991.svg?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI">
    <img src="https://img.shields.io/badge/vercel%20ai%20SDK-%23000.svg?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel AI SDK">
    <img src="https://img.shields.io/badge/clerk-%236C47FF.svg?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk">
    <img src="https://img.shields.io/badge/zod-%233E67B1.svg?style=for-the-badge&logo=zod&logoColor=white" alt="Zod">
  </div>
<br />

<h2 id="about">💡 Mengapa Kivo?</h2>

Memulai bisnis adalah pertaruhan besar. Tanpa data yang tepat, ide brilian sekalipun bisa gagal di tengah jalan.

### 😟 Masalah
Banyak founder dan calon pengusaha terjebak dalam situasi ini:

* ❌ **Decision Paralysis:** Terlalu banyak keraguan (*hesitation*) untuk melangkah karena takut salah mengambil keputusan.
* ❌ **Risiko Kegagalan Tinggi:** Membangun produk yang didasarkan pada asumsi semata, bukan kebutuhan pasar yang valid.
* ❌ **Strategi yang Abstrak:** Memiliki ide di kepala tetapi kesulitan menurunkannya menjadi model bisnis yang konkret dan terstruktur.

### 😃 Solusi Kami
**Kivo** hadir sebagai platform validasi cerdas untuk mengubah keraguan menjadi keyakinan berbasis data:

* ✅ **Pre-Launch Validation:** Kami memvalidasi konsep bisnis Anda *sebelum* satu baris kode ditulis atau biaya dikeluarkan.
* ✅ **Data-Driven Predictions:** Menggunakan prediksi pasar berbasis data untuk memastikan ide Anda relevan hari ini dan *future-proof* untuk masa depan.
* ✅ **Structured Business Model:** Menghasilkan **Business Model Canvas (BMC)** yang solid secara otomatis untuk mempertajam strategi eksekusi Anda.

<h2 id="how-to-run">📋 Prerequisites</h2>

Pastikan Anda telah menginstal:
- **Node.js** (Gunakan versi LTS terbaru)
- **Docker & Docker Compose**
- **Git**
- **Mongosh**

## 🏗️ Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/mhaatha/kivo-api.git
cd kivo-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment
Copy file `.env.example` ke `.env`:
```bash
cp .env.example .env
```

Edit file `.env` dan isi variabel berikut:
```env
# Express Server Configuration
PORT=5000

# MongoDB Connection
MONGODB_URI=your_mongodb_uri

# Clerk Authentication (diperlukan untuk auth)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SIGNING_SECRET=your_clerk_webhook_secret

# Frontend URLs (untuk CORS)
FRONTEND_URL1=https://kivoai.netlify.app

# Kolosal AI API Configuration
KOLOSAL_API_ENDPOINT=https://api.kolosal.example.com
KOLOSAL_API_KEY=your_kolosal_api_key

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key

# OpenRouter API Key (untuk AI chat)
OPENROUTER_API_KEY=your_openrouter_api_key

# Supermemory API Key (untuk AI memory)
SUPERMEMORY_API_KEY=your_supermemory_api_key
```

## 🐳 Menjalankan MongoDB dengan Docker

Kivo memerlukan MongoDB untuk menyimpan data. Jalankan dengan Docker Compose:
```bash
docker-compose up -d
```

Perintah ini akan:
- Menjalankan MongoDB di port `27017`
- Membuat volume data persisten untuk MongoDB
- Menggunakan replica set untuk performa yang lebih baik

Setelah container berjalan, jalankan perintah berikut ntuk mengaktifkan fitur transaction:
```bash
docker exec -it kivo-mongo mongosh --eval "rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'localhost:27017' }] })"
```
Jika output menampilkan { "ok" : 1 }, berarti fitur transaksi berhasi dijalankan.

Untuk menghentikan MongoDB:
```bash
docker-compose down
```

## 🚀 Menjalankan Aplikasi

### Mode Development (dengan auto-reload)
```bash
npm run dev
```

### Mode Production
```bash
npm start
```

Server akan berjalan di `http://localhost:5000` (atau port yang Anda tentukan di `.env`)

## 🔍 Testing

### Jalankan Semua Tests
```bash
npm test
```

### Jalankan Tests dengan Watch Mode
```bash
npm run test:watch
```

### Jalankan Tests dengan Coverage Report
```bash
npm run test:coverage
```

### Jalankan Integration Tests
```bash
npm run test:integration
```

### Jalankan AI-powered Tests (jika tersedia)
```bash
npm run test:ai
```

## 📝 API Documentation

API documentation tersedia di file OpenAPI:
- **OpenAPI Spec**: `api/v1.0.yaml`

Untuk melihat route yang tersedia:
```bash
npm run route:list
```

## 🛠️ Core Features & Routes

### Authentication (Clerk)
- `POST /api/v1/auth/*` - Authentication endpoints

### Business Model Canvas
- `POST /api/v1/bmc/bmc-routes` - BMC operations
- `POST /api/bmc/bmc-routes` - Alternative BMC endpoint

### Database Management
- `GET /api/v1/databases` - Database operations

### AI Chat
- `POST /api/chat` - AI chat untuk konsultasi bisnis
- `GET /api/chats/:id` - Mengambil history chat

### Protected Routes
- `GET /api/v1/protected/*` - Protected endpoints yang memerlukan authentication

## 📊 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Port untuk Express server | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/kivo` |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key - needed untuk authentication | `pk_test_***` |
| `CLERK_SECRET_KEY` | Clerk secret key - needed untuk authentication | `sk_test_***` |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Clerk webhook secret - needed untuk auth webhooks | `whsec_***` |
| `FRONTEND_URL1` | Frontend URL untuk CORS | `https://kivoai.netlify.app` |
| `KOLOSAL_API_ENDPOINT` | Kolosal AI API endpoint - needed untuk AI features | `https://api.kolosal.example.com` |
| `KOLOSAL_API_KEY` | Kolosal AI API key - needed untuk AI features | `your_kolosal_api_key` |
| `JWT_SECRET` | Secret key untuk JWT tokens - needed untuk authentication | `your_super_secret_jwt_key` |
| `OPENROUTER_API_KEY` | OpenRouter API key - needed untuk chat AI | `your_openrouter_api_key` |
| `SUPERMEMORY_API_KEY` | Supermemory API key - needed untuk AI memory | `your_supermemory_api_key` |

**Catatan Penting**: Semua variabel di atas adalah **WAJIB** diisi untuk menjaga kemananan dan kelengkapan aplikasi, meskipun beberapa fungsi fitur mungkin tidak berjalan jika value-nya dikosongkan. 

**Bagaimana Setiap Env Bekerja Jika Dikosongkan:**
- `PORT` - **HARUS ada**, aplikasi error jika kosong
- `MONGODB_URI` - **HARUS ada**, aplikasi error jika kosong  
- `CLERK_*` - Aplikasi tetap jalan tanpa auth features
- `FRONTEND_URL1` - CORS tidak akan aktif, frontend access akan error dari origin di luar localhost
- `KOLOSAL_*` - AI features yang menggunakan Kolosal AI tidak akan aktif
- `JWT_SECRET` - Auth features yang pakai JWT tidak akan jalan
- `OPENROUTER_API_KEY` - Chat AI tidak akan aktif
- `SUPERMEMORY_API_KEY` - AI memory features tidak akan aktif

### ⚡ API Keys Configuration

**Untuk mendapatkan API keys, ikuti panduan berikut:**

**1. Clerk Authentication**:
- Buat akun di https://clerk.com
- Ambil Publishable Key & Secret Key dari dashboard
- Setup webhook dan dapatkan Webhook Signing Secret

**2. OpenRouter AI** (Untuk chat AI):  
- Daftar di https://openrouter.ai
- Buat API key di dashboard

**3. Supermemory AI** (Untuk AI memory):
- Daftar di https://supermemory.ai
- Buat API key untuk fitur memory AI

**4. Kolosal AI** (Untuk AI processing):
- Dapatkan akses ke Kolosal AI API
- Masukkan endpoint dan API key sesuai provider

## 🔄 Development Workflow

1. **Setup Environment** - Selesaikan konfigurasi `.env`
2. **Jalankan MongoDB** - `docker-compose up -d`
3. **Install Dependencies** - `npm install`
4. **Development Mode** - `npm run dev`
5. **Testing** - `npm run test:watch`
6. **Build & Deploy** - Proses deployment ke production

## 🚨 Troublehooting

### MongoDB Connection Error
- Pastikan MongoDB berjalan: `docker ps`
- Cek logs: `docker logs kivo-mongo`
- Restart MongoDB: `docker-compose restart`

### AI Features Error
- Pastikan `OPENROUTER_API_KEY` dan `SUPERMEMORY_API_KEY` terisi untuk fitur AI chat
- Verifikasi `KOLOSAL_API_ENDPOINT` dan `KOLOSAL_API_KEY` jika AI tidak merespons

### Clerk Authentication Error
- Pastikan semua `CLERK_*` environment variables terisi jika ingin menggunakan auth features

### CORS Error
- Pastikan `FRONTEND_URL1` sesuai dengan URL frontend Anda

### Dependencies Error
- Hapus `node_modules` dan install ulang: `rm -rf node_modules && npm install`

### Dependencies Error
- Hapus `node_modules` dan install ulang: `rm -rf node_modules && npm install`

## 📁 Project Structure

```
kivo-api/
├── api/                    # OpenAPI documentation
├── src/
│   ├── app/               # Core application code
│   │   ├── ai/           # AI chat functionality
│   │   ├── config/       # Application configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middlewares/  # Express middlewares
│   │   ├── models/       # Mongoose models
│   │   ├── repositories/ # Data access layer
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   ├── validations/  # Validation schemas
│   │   └── routes/       # API route definitions
│   ├── scripts/         # Utility scripts
│   ├── types/            # TypeScript definitions
│   └── server.js         # Application entry point
├── tests/                 # Test files
├── docker-compose.yaml   # Docker configuration
└── vitest.config.js      # Test configuration
```

## 🎯 Next Steps

1. **Integrasi dengan Frontend**: Hubungkan dengan aplikasi frontend Kivo
2. **Monitoring**: Setup monitoring dan logging
3. **Scalability**: Konfigurasi untuk production environment
4. **Security**: Implementasi security best practices

## 📞 Support

Jika mengalami masalah:
- Cek logs aplikasi untuk error messages
- Pastikan semua environment variables terisi dengan benar
- Verifikasi koneksi MongoDB dan Clerk configuration

---
