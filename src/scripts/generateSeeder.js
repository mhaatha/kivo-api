import 'dotenv/config';
import mongoose from 'mongoose';
import { BmcPost } from '../app/models/bmc.model.js';

const { ObjectId } = mongoose.Types;

async function seedBmcData() {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  
  console.log('🔌 Connecting to MongoDB...');
  
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ Connected to database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB');
    console.error('Error details:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Check your internet connection');
    console.error('2. Verify MONGODB_URI in .env file is correct');
    console.error('3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.error('4. Check if MongoDB Atlas cluster is running');
    throw error;
  }

  const bmcData = [
        {
            "_id": "69345c5f1da1df4bf4000000",
            "location": {
                "latitude": -6.2088,
                "longitude": 106.8456,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Siswa SMA dan calon mahasiswa di Jakarta yang terbiasa menggunakan smartphone dan internet, membutuhkan platform belajar online yang fleksibel dan terjangkau. Segmen sekunder: orang tua yang ingin memantau progres belajar anak."
                },
                {
                    "tag": "value_propositions",
                    "content": "Platform belajar online dengan akses materi kapan saja, harga paket yang dapat dicicil, fitur progress report, dan konten yang terus diperbarui."
                },
                {
                    "tag": "channels",
                    "content": "Aplikasi mobile, website, media sosial, iklan digital tertarget, dan kerja sama dengan komunitas belajar serta kampus."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Customer support melalui chat, grup komunitas online, webinar rutin, dan notifikasi personal terkait progres belajar pengguna."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari paket berlangganan bulanan, penjualan kelas premium, dan kerja sama sponsorship atau promosi brand edukasi yang relevan."
                },
                {
                    "tag": "key_resources",
                    "content": "Tim pengembang aplikasi, server dan infrastruktur cloud, tim konten dan tutor, brand yang kuat, serta sistem pembayaran online."
                },
                {
                    "tag": "key_activities",
                    "content": "Pengembangan dan pemeliharaan aplikasi, pembuatan konten baru, aktivitas marketing digital, dan analisis data penggunaan untuk peningkatan fitur."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Penyedia payment gateway, komunitas belajar, influencer edukasi, dan institusi pendidikan yang menyediakan materi resmi."
                },
                {
                    "tag": "cost_structure",
                    "content": "Biaya pengembangan dan pemeliharaan aplikasi, server dan bandwidth, gaji tim konten dan tutor, biaya marketing digital, dukungan pelanggan, dan biaya lisensi software."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000001"
            ,
            "location": {
                "latitude": -6.9175,
                "longitude": 107.6191,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Mahasiswa dan penghuni kos di Bandung dengan waktu terbatas tetapi membutuhkan laundry kiloan kampus yang praktis dan terpercaya. Segmen sekunder: karyawan muda di sekitar kampus."
                },
                {
                    "tag": "value_propositions",
                    "content": "Laundry kiloan kampus dengan layanan cepat, transparansi harga per kilogram, layanan antar jemput, dan opsi paket langganan hemat."
                },
                {
                    "tag": "channels",
                    "content": "WhatsApp, telepon, media sosial, brosur di kos dan kampus, serta listing di platform layanan lokal."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Layanan ramah dan responsif, pengingat otomatis jadwal penjemputan, penawaran promo berkala, dan follow up setelah layanan untuk memastikan kepuasan."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari biaya laundry per kilogram, biaya tambahan untuk layanan ekspres dan lipat rapi, serta paket langganan bulanan."
                },
                {
                    "tag": "key_resources",
                    "content": "Tim cuci dan setrika, mesin cuci dan pengering, deterjen dan perlengkapan pendukung, kendaraan operasional untuk antar jemput, serta sistem pencatatan pesanan."
                },
                {
                    "tag": "key_activities",
                    "content": "Penjemputan dan pengantaran cucian, proses cuci dan setrika, kontrol kualitas, penjadwalan order, dan promosi ke komunitas sekitar kampus."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Pemasok deterjen dan perlengkapan laundry, pemilik kos, komunitas mahasiswa, serta mitra ojek setempat untuk bantuan antar jemput."
                },
                {
                    "tag": "cost_structure",
                    "content": "Gaji tim laundry, pembelian deterjen dan bahan pendukung, biaya listrik dan air, perawatan mesin, biaya transportasi, dan biaya marketing sederhana."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000002"
            ,
            "location": {
                "latitude": -6.2,
                "longitude": 106.82,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Karyawan kantor usia 22-35 tahun di Jakarta yang sibuk dan ingin makan siang sehat tanpa repot. Segmen sekunder: komunitas olahraga dan gym di area perkantoran."
                },
                {
                    "tag": "value_propositions",
                    "content": "Katering sehat kantoran dengan menu seimbang, kalori terukur, pengiriman tepat waktu ke kantor, dan fleksibilitas pemesanan harian atau paket mingguan."
                },
                {
                    "tag": "channels",
                    "content": "WhatsApp dan website pemesanan, media sosial, kerja sama dengan office manager, dan promosi di komunitas olahraga serta gym."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Admin responsif untuk pemesanan, grup broadcast menu harian, survei kepuasan rutin, dan penanganan komplain yang cepat."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari penjualan paket makan harian, paket langganan mingguan atau bulanan, dan pemesanan corporate untuk meeting atau event."
                },
                {
                    "tag": "key_resources",
                    "content": "Dapur produksi yang higienis, tim koki dan kurir, kendaraan pengantar, sistem manajemen pesanan, serta supplier bahan baku segar."
                },
                {
                    "tag": "key_activities",
                    "content": "Perencanaan menu sehat, pengadaan bahan baku, proses masak dan pengemasan, pengantaran tepat waktu, dan aktivitas promosi."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Pemasok sayur dan protein segar, gym dan komunitas olahraga, perusahaan untuk kerja sama corporate, serta platform pembayaran digital."
                },
                {
                    "tag": "cost_structure",
                    "content": "Biaya bahan baku makanan, gaji koki dan kurir, sewa dapur, utilitas, pengemasan makanan, dan biaya promosi."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000003"
            ,
            "location": {
                "latitude": -7.7956,
                "longitude": 110.3695,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Pembeli muda yang suka produk lokal unik di Yogyakarta dan kota lain, senang berbelanja online. Segmen sekunder: wisatawan yang mencari oleh-oleh khas secara praktis."
                },
                {
                    "tag": "value_propositions",
                    "content": "Marketplace kerajinan UMKM lokal dengan kurasi produk berkualitas, fitur cerita pembuat, pengiriman ke seluruh Indonesia, dan metode pembayaran yang aman."
                },
                {
                    "tag": "channels",
                    "content": "Website dan aplikasi marketplace, media sosial, kolaborasi dengan komunitas kreatif dan event craft fair, serta iklan digital."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Layanan pelanggan melalui chat, sistem review dan rating, newsletter produk baru, dan campaign promosi tematik saat hari besar."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Komisi dari setiap transaksi penjualan, biaya fitur iklan untuk toko UMKM, dan kerja sama brand untuk kampanye khusus."
                },
                {
                    "tag": "key_resources",
                    "content": "Platform marketplace, tim teknis dan operasional, jaringan UMKM pengrajin, sistem pembayaran dan logistik terintegrasi, serta brand yang dipercaya."
                },
                {
                    "tag": "key_activities",
                    "content": "Onboarding UMKM, pengembangan fitur platform, kurasi produk, aktivitas marketing digital, dan manajemen operasional pesanan."
                },
                {
                    "tag": "key_partnerships",
                    "content": "UMKM pengrajin lokal, perusahaan logistik, penyedia payment gateway, komunitas kreatif, dan pemerintah daerah untuk program pemberdayaan."
                },
                {
                    "tag": "cost_structure",
                    "content": "Biaya pengembangan dan pemeliharaan platform, gaji tim operasional dan marketing, biaya server, customer service, dan biaya kampanye promosi."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000004"
            ,
            "location": {
                "latitude": -7.2575,
                "longitude": 112.7521,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Freelancer, startup kecil, dan pekerja remote di Surabaya yang membutuhkan ruang kerja fleksibel dengan fasilitas lengkap. Segmen sekunder: komunitas kreatif seperti desainer dan content creator."
                },
                {
                    "tag": "value_propositions",
                    "content": "Coworking space kreatif dengan internet cepat, ruang meeting, area event, pantry, dan opsi sewa harian hingga bulanan dengan harga terjangkau."
                },
                {
                    "tag": "channels",
                    "content": "Lokasi fisik yang mudah diakses, website dan media sosial, listing di platform pencari ruang kerja, serta kerja sama dengan komunitas startup."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Staff front desk yang ramah, grup komunitas member, event rutin seperti workshop dan networking, serta program loyalitas untuk penyewa tetap."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari sewa meja hot desk, ruang privat, ruang meeting, penyewaan event space, dan penjualan minuman atau snack."
                },
                {
                    "tag": "key_resources",
                    "content": "Bangunan dan interior yang nyaman, furnitur dan perlengkapan kantor, jaringan internet stabil, tim operasional, dan sistem reservasi."
                },
                {
                    "tag": "key_activities",
                    "content": "Operasional harian ruang kerja, pemeliharaan fasilitas, penyelenggaraan event komunitas, pemasaran ke target pasar, dan pengelolaan reservasi."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Pemilik gedung, penyedia internet, komunitas startup dan freelancer, sponsor event, serta vendor makanan dan minuman."
                },
                {
                    "tag": "cost_structure",
                    "content": "Biaya sewa atau cicilan ruang, renovasi dan perawatan interior, gaji karyawan, utilitas, serta biaya marketing dan event."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000005"
            ,
            "location": {
                "latitude": 3.5952,
                "longitude": 98.6722,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Pengguna motor harian di Medan yang sering terjebak macet dan membutuhkan bengkel motor panggilan yang cepat. Segmen sekunder: driver ojek online di area padat."
                },
                {
                    "tag": "value_propositions",
                    "content": "Bengkel motor panggilan yang datang ke lokasi pelanggan, transparansi harga, waktu respon singkat, dan teknisi yang terlatih."
                },
                {
                    "tag": "channels",
                    "content": "Telepon dan WhatsApp, media sosial, kerja sama dengan pangkalan ojek dan parkiran, serta listing di aplikasi layanan lokal."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Admin yang siap merespon 24 jam, update status teknisi, follow up setelah layanan, dan program poin untuk pelanggan rutin."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari jasa servis dan perbaikan ringan, penjualan spare part dasar, dan biaya tambahan untuk layanan darurat di luar jam normal."
                },
                {
                    "tag": "key_resources",
                    "content": "Tim mekanik, peralatan servis portable, kendaraan operasional, stok spare part dasar, dan sistem penjadwalan panggilan."
                },
                {
                    "tag": "key_activities",
                    "content": "Penerimaan dan penjadwalan panggilan, perbaikan di lokasi pelanggan, pengadaan spare part, pelatihan mekanik, dan promosi."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Distributor spare part, komunitas ojek online, pengelola parkir dan SPBU, serta penyedia asuransi atau layanan bantuan darurat."
                },
                {
                    "tag": "cost_structure",
                    "content": "Gaji mekanik, pembelian peralatan dan spare part, biaya bahan bakar dan perawatan kendaraan operasional, pulsa dan internet, serta biaya promosi."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000006"
            ,
            "location": {
                "latitude": -6.9,
                "longitude": 107.61,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Anak usia sekolah dasar dan menengah di Bandung yang ingin belajar musik tanpa harus ke tempat kursus. Segmen sekunder: dewasa muda yang ingin belajar hobi baru."
                },
                {
                    "tag": "value_propositions",
                    "content": "Les musik privat ke rumah dengan jadwal fleksibel, pengajar terkurasi, kurikulum bertahap, dan opsi kelas online sebagai pelengkap."
                },
                {
                    "tag": "channels",
                    "content": "Media sosial, rekomendasi dari mulut ke mulut, kerja sama dengan sekolah, dan listing di platform les privat."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Admin yang membantu penjadwalan, laporan perkembangan rutin kepada orang tua, komunikasi intensif melalui chat, dan pemberian sertifikat kelulusan level."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari biaya per sesi les, paket bulanan, dan kelas intensif menjelang ujian atau pertunjukan."
                },
                {
                    "tag": "key_resources",
                    "content": "Jaringan pengajar musik, materi ajar dan silabus, alat musik pendukung, serta sistem penjadwalan dan pembayaran."
                },
                {
                    "tag": "key_activities",
                    "content": "Seleksi dan pelatihan tutor, penjadwalan kelas, pelaksanaan les, evaluasi perkembangan siswa, dan pemasaran."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Sekolah formal dan kursus musik, komunitas musik lokal, penyedia alat musik, dan platform pembayaran digital."
                },
                {
                    "tag": "cost_structure",
                    "content": "Fee tutor per sesi, biaya administrasi dan operasional, pengadaan materi ajar, biaya marketing online, dan pengembangan sistem penjadwalan."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000007"
            ,
            "location": {
                "latitude": -5.1477,
                "longitude": 119.4327,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Karyawan dan mahasiswa di Makassar yang sibuk dan tidak sempat memasak tetapi ingin makanan rumahan. Segmen sekunder: keluarga muda di perumahan sekitar."
                },
                {
                    "tag": "value_propositions",
                    "content": "Warung makan rumahan dengan sistem langganan harian, menu berganti setiap hari, pengiriman ke rumah atau kantor, dan harga yang terjangkau."
                },
                {
                    "tag": "channels",
                    "content": "WhatsApp, grup lingkungan dan kantor, media sosial, dan kerja sama dengan pemilik kos serta kantor kecil."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Komunikasi langsung dengan pelanggan, polling menu mingguan, penanganan komplain cepat, dan bonus porsi atau diskon untuk pelanggan setia."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari paket langganan makan siang dan malam, penjualan satuan untuk pelanggan tanpa langganan, dan pesanan khusus untuk arisan atau acara kecil."
                },
                {
                    "tag": "key_resources",
                    "content": "Dapur produksi, tim masak dan kurir, kendaraan pengantar, resep menu rumahan, dan sistem pencatatan pelanggan langganan."
                },
                {
                    "tag": "key_activities",
                    "content": "Belanja bahan baku, memasak dan mengemas makanan, pengantaran tepat waktu, perencanaan menu, dan promosi."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Pemasok bahan baku lokal, komunitas RT atau perumahan, kantor kecil, dan platform pembayaran digital."
                },
                {
                    "tag": "cost_structure",
                    "content": "Biaya bahan baku, gaji tim masak dan kurir, gas dan listrik, biaya kemasan sekali pakai, serta promosi."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000008"
            ,
            "location": {
                "latitude": -6.4025,
                "longitude": 106.7942,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Orang tua baru di Depok yang ingin menghemat biaya perlengkapan bayi dan tidak punya banyak ruang penyimpanan. Segmen sekunder: keluarga yang sering bepergian dan tidak ingin membeli banyak barang bayi."
                },
                {
                    "tag": "value_propositions",
                    "content": "Sewa perlengkapan bayi seperti stroller, baby box, dan car seat dengan kondisi bersih, terawat, durasi sewa fleksibel, dan layanan antar jemput."
                },
                {
                    "tag": "channels",
                    "content": "Media sosial, marketplace, website katalog, rekomendasi dari komunitas ibu, dan kerja sama dengan rumah bersalin atau klinik."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Konsultasi pemilihan produk yang tepat, pengingat jadwal pengembalian, layanan after sales jika ada masalah, dan program diskon untuk pelanggan yang sering sewa."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari biaya sewa per periode, deposit yang sebagian bisa hangus jika terjadi kerusakan, dan penjualan barang bekas pakai dengan kondisi baik."
                },
                {
                    "tag": "key_resources",
                    "content": "Stok perlengkapan bayi berkualitas, gudang penyimpanan, tim pembersih dan perawatan, serta sistem manajemen inventori dan pemesanan."
                },
                {
                    "tag": "key_activities",
                    "content": "Pembelian dan kurasi barang, pembersihan dan sterilisasi setelah sewa, pengantaran dan penjemputan, serta promosi ke komunitas ibu."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Distributor perlengkapan bayi, rumah bersalin dan klinik, komunitas parenting, dan platform marketplace."
                },
                {
                    "tag": "cost_structure",
                    "content": "Biaya pembelian barang, perawatan dan pembersihan berkala, sewa gudang, gaji staf, pengantaran, dan biaya marketing."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000009"
            ,
            "location": {
                "latitude": -6.9667,
                "longitude": 110.4167,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Komunitas olahraga dan tim futsal amatir di Semarang yang ingin memesan lapangan dengan mudah tanpa telepon berkali-kali. Segmen sekunder: kantor yang sering mengadakan kegiatan olahraga dan team building."
                },
                {
                    "tag": "value_propositions",
                    "content": "Platform booking lapangan olahraga dengan informasi jadwal real-time, pembayaran online, pilihan beberapa lokasi lapangan, dan fitur pembagian biaya ke anggota tim."
                },
                {
                    "tag": "channels",
                    "content": "Aplikasi mobile, website, media sosial, kerja sama dengan pengelola lapangan, dan promosi di komunitas olahraga."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Layanan pelanggan melalui chat, notifikasi pengingat jadwal main, feedback setelah bermain, dan program poin untuk tim yang sering booking."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Komisi dari setiap transaksi booking, biaya fitur premium untuk pengelola lapangan, dan iklan brand olahraga di dalam aplikasi."
                },
                {
                    "tag": "key_resources",
                    "content": "Platform digital, database lapangan, tim pengembang dan operasional, serta hubungan baik dengan pengelola lapangan."
                },
                {
                    "tag": "key_activities",
                    "content": "Integrasi jadwal lapangan, pemeliharaan aplikasi, akuisisi pengguna dan mitra lapangan, serta aktivitas promosi."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Pengelola lapangan futsal dan olahraga lain, komunitas olahraga lokal, sponsor perlengkapan olahraga, dan penyedia payment gateway."
                },
                {
                    "tag": "cost_structure",
                    "content": "Biaya pengembangan dan server, gaji tim operasional dan marketing, komisi mitra, dan biaya kampanye promosi."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf400000a"
            ,
            "location": {
                "latitude": -7.9666,
                "longitude": 112.6326,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Anak muda dan keluarga di Malang yang suka nongkrong sambil menikmati roti fresh dan kopi berkualitas. Segmen sekunder: pekerja remote yang mencari tempat kerja nyaman dengan WiFi."
                },
                {
                    "tag": "value_propositions",
                    "content": "Toko roti artisan dan kopi dengan bahan berkualitas, variasi roti fresh from the oven, kopi specialty, suasana hangat, dan spot foto menarik."
                },
                {
                    "tag": "channels",
                    "content": "Outlet fisik, media sosial, aplikasi maps dan review, kerja sama dengan food delivery, serta program pre-order untuk roti tertentu."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Pelayanan ramah di outlet, kartu stamp atau program member, interaksi aktif di media sosial, dan respon cepat terhadap review."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Penjualan roti dan pastry, penjualan minuman kopi dan non kopi, pemesanan besar untuk event, serta penjualan biji kopi dan merchandise."
                },
                {
                    "tag": "key_resources",
                    "content": "Dapur roti dengan peralatan lengkap, barista dan baker terlatih, lokasi strategis, interior nyaman, dan brand yang kuat."
                },
                {
                    "tag": "key_activities",
                    "content": "Produksi roti harian, penyajian minuman, pelayanan di outlet, pengembangan resep baru, dan aktivitas promosi."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Supplier tepung dan bahan baku, roaster kopi lokal, platform delivery online, dan komunitas pecinta kopi atau baking."
                },
                {
                    "tag": "cost_structure",
                    "content": "Biaya bahan baku, gaji karyawan, sewa tempat, utilitas, perawatan peralatan, kemasan, dan biaya marketing."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf400000b"
            ,
            "location": {
                "latitude": -8.65,
                "longitude": 115.2167,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Rumah tangga peduli lingkungan di Denpasar yang ingin memilah sampah namun tidak punya waktu mengelolanya. Segmen sekunder: villa dan usaha kecil yang ingin mengelola sampah lebih baik."
                },
                {
                    "tag": "value_propositions",
                    "content": "Layanan pengambilan sampah terpilah berlangganan dengan jadwal rutin, edukasi cara memilah, laporan berkala jumlah sampah yang berhasil didaur ulang, dan insentif poin."
                },
                {
                    "tag": "channels",
                    "content": "Media sosial, penyuluhan ke komplek perumahan, kerja sama dengan pengelola villa, dan promosi melalui komunitas lingkungan."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Komunikasi rutin lewat chat dan grup, edukasi berkelanjutan, laporan transparan, dan penghargaan sederhana bagi pelanggan aktif."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Biaya berlangganan bulanan dari rumah tangga dan usaha kecil, penjualan material daur ulang ke pengepul, dan kerja sama dengan program CSR perusahaan."
                },
                {
                    "tag": "key_resources",
                    "content": "Armada pengangkut, fasilitas pemilahan dan penyimpanan, tim lapangan, materi edukasi, dan sistem pencatatan volume sampah."
                },
                {
                    "tag": "key_activities",
                    "content": "Penjemputan sampah terjadwal, pemilahan dan pengiriman ke pihak daur ulang, edukasi ke pelanggan, dan pengelolaan data."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Bank sampah dan pengepul, komunitas lingkungan, pemerintah daerah, dan perusahaan yang memiliki program CSR lingkungan."
                },
                {
                    "tag": "cost_structure",
                    "content": "Gaji tim lapangan, operasional kendaraan, biaya sewa atau pengelolaan gudang, materi edukasi, dan promosi."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf400000c"
            ,
            "location": {
                "latitude": -6.595,
                "longitude": 106.816,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Pria usia 18-40 tahun di Bogor yang peduli penampilan dan menyukai gaya rambut kekinian. Segmen sekunder: profesional muda yang ingin tampil rapi setiap saat."
                },
                {
                    "tag": "value_propositions",
                    "content": "Barbershop pria dengan barber berpengalaman, interior nyaman, layanan cuci rambut dan styling, serta opsi paket grooming lengkap."
                },
                {
                    "tag": "channels",
                    "content": "Lokasi barbershop di area ramai, media sosial, aplikasi maps dan review, serta promo bundling dengan kafe atau gym sekitar."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Sistem reservasi online, pengingat jadwal potong rambut, kartu member, dan interaksi santai di outlet."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari jasa potong rambut, paket grooming, penjualan pomade dan produk styling, serta paket langganan bulanan."
                },
                {
                    "tag": "key_resources",
                    "content": "Barber terlatih, kursi dan peralatan cukur berkualitas, interior yang nyaman, serta sistem reservasi dan pembayaran."
                },
                {
                    "tag": "key_activities",
                    "content": "Layanan potong rambut dan grooming, pelatihan barber, kebersihan outlet, promosi di media sosial, dan pengelolaan reservasi."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Distributor produk grooming pria, komunitas pria muda, pemilik ruko, dan kafe atau gym sekitar untuk cross promotion."
                },
                {
                    "tag": "cost_structure",
                    "content": "Sewa ruko, gaji barber dan kasir, pembelian peralatan dan produk, utilitas, dan biaya promosi."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf400000d"
            ,
            "location": {
                "latitude": -6.1783,
                "longitude": 106.63,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Content creator, pasangan muda, dan keluarga di Tangerang yang membutuhkan studio foto terjangkau. Segmen sekunder: UMKM yang membutuhkan foto produk profesional dan konten video pendek."
                },
                {
                    "tag": "value_propositions",
                    "content": "Studio foto dan konten kreator dengan berbagai backdrop, lighting profesional, paket foto dan video, serta opsi sewa studio untuk produksi mandiri."
                },
                {
                    "tag": "channels",
                    "content": "Media sosial, website portofolio, kerja sama dengan wedding organizer dan MUA, serta listing di platform sewa studio."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Konsultasi konsep sebelum sesi foto, pengiriman file digital yang cepat, revisi terbatas secara gratis, dan program diskon untuk repeat client."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari paket foto, paket video, sewa studio per jam, dan jasa editing tambahan."
                },
                {
                    "tag": "key_resources",
                    "content": "Ruang studio, peralatan lighting dan kamera, properti dan backdrop, tim fotografer dan editor, serta sistem booking."
                },
                {
                    "tag": "key_activities",
                    "content": "Pemotretan dan perekaman video, editing, pengelolaan jadwal studio, perawatan peralatan, dan promosi."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Wedding organizer, MUA, vendor dekorasi, komunitas fotografer dan videografer, serta platform booking."
                },
                {
                    "tag": "cost_structure",
                    "content": "Biaya sewa atau cicilan studio, investasi peralatan, gaji kru, utilitas, dan biaya promosi."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf400000e"
            ,
            "location": {
                "latitude": -6.2383,
                "longitude": 106.9756,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Pembeli online di Bekasi dan kota lain yang suka produk luar negeri namun ingin harga lebih hemat. Segmen sekunder: reseller kecil yang ingin stok barang unik dengan modal terbatas."
                },
                {
                    "tag": "value_propositions",
                    "content": "Jasa titip produk luar negeri berbasis aplikasi dengan daftar titipan yang transparan, estimasi biaya jelas, tracking pesanan, dan sistem review shopper."
                },
                {
                    "tag": "channels",
                    "content": "Aplikasi mobile, media sosial, komunitas pecinta brand luar negeri, dan promosi melalui influencer belanja."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Chat in-app antara shopper dan pelanggan, update status pengiriman, sistem poin dan level, serta penanganan sengketa yang adil."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Fee jasa titip per pesanan, margin kurs dan biaya layanan, serta iklan brand atau toko yang ingin dipromosikan."
                },
                {
                    "tag": "key_resources",
                    "content": "Platform aplikasi, jaringan shopper di luar negeri, tim operasional, sistem pembayaran dan wallet, serta brand yang dipercaya."
                },
                {
                    "tag": "key_activities",
                    "content": "Kurasi shopper, verifikasi pesanan, manajemen pembayaran, koordinasi pengiriman, dan kampanye promosi."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Jasa pengiriman internasional, penyedia payment gateway, komunitas pembeli online, dan influencer belanja."
                },
                {
                    "tag": "cost_structure",
                    "content": "Biaya pengembangan dan server aplikasi, gaji tim operasional dan customer service, biaya promosi, dan manajemen risiko sengketa."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf400000f"
            ,
            "location": {
                "latitude": -1.2379,
                "longitude": 116.8523,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Pemilik hewan peliharaan kelas menengah di Balikpapan yang peduli kesehatan dan kenyamanan hewan. Segmen sekunder: komunitas pecinta hewan dan penangkar lokal."
                },
                {
                    "tag": "value_propositions",
                    "content": "Klinik hewan dan pet shop satu pintu dengan layanan konsultasi dokter hewan, vaksinasi, grooming, serta produk makanan dan aksesoris lengkap."
                },
                {
                    "tag": "channels",
                    "content": "Lokasi klinik di area mudah diakses, media sosial, rekomendasi dari mulut ke mulut, dan kerja sama dengan komunitas pecinta hewan."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Pencatatan riwayat medis hewan, pengingat jadwal vaksin dan kontrol, komunikasi via chat, dan program member dengan poin."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari jasa pemeriksaan dan tindakan medis, jasa grooming, penjualan makanan dan perlengkapan hewan, serta layanan titip hewan jika ada."
                },
                {
                    "tag": "key_resources",
                    "content": "Dokter hewan dan asisten, ruang praktik dan perawatan, peralatan medis dasar, stok makanan dan perlengkapan, serta sistem rekam medis."
                },
                {
                    "tag": "key_activities",
                    "content": "Pemeriksaan dan perawatan hewan, pelayanan di pet shop, pengadaan stok, edukasi pemilik hewan, dan promosi."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Distributor makanan hewan, komunitas pecinta hewan, organisasi penyelamatan hewan, dan laboratorium rujukan."
                },
                {
                    "tag": "cost_structure",
                    "content": "Gaji dokter dan staf, sewa klinik, pembelian stok, perawatan peralatan, utilitas, dan biaya promosi."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000010"
            ,
            "location": {
                "latitude": -2.9909,
                "longitude": 104.7566,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Rumah tangga dan kos-kosan di Palembang yang sering membutuhkan isi ulang galon dan gas dengan cepat. Segmen sekunder: warung kecil yang sering membutuhkan galon dan gas untuk operasional."
                },
                {
                    "tag": "value_propositions",
                    "content": "Layanan antar galon dan gas via WhatsApp dengan respon cepat, stok terjamin, sistem pencatatan pelanggan, dan opsi pembayaran cashless."
                },
                {
                    "tag": "channels",
                    "content": "WhatsApp, telepon, stiker dan spanduk di lingkungan, serta daftar kontak dari rekomendasi tetangga."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Nomor admin yang mudah dihubungi, pengingat ketika biasanya pelanggan akan order ulang, dan diskon khusus untuk pelanggan setia."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari margin penjualan galon dan gas, biaya antar untuk jarak tertentu, dan paket langganan mingguan untuk warung."
                },
                {
                    "tag": "key_resources",
                    "content": "Stok galon dan tabung gas, gudang kecil, kendaraan operasional, serta buku atau aplikasi pencatatan pesanan."
                },
                {
                    "tag": "key_activities",
                    "content": "Penerimaan order, pengantaran ke pelanggan, pengecekan stok, dan promosi di lingkungan sekitar."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Distributor air galon dan gas, ketua RT atau pengurus lingkungan, dan komunitas warga sekitar."
                },
                {
                    "tag": "cost_structure",
                    "content": "Biaya pembelian stok, gaji kurir jika ada, bahan bakar kendaraan, biaya komunikasi, dan cetak materi promosi sederhana."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000011"
            ,
            "location": {
                "latitude": -0.95,
                "longitude": 100.3531,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Fresh graduate dan karyawan di Padang serta kota lain yang ingin lulus seleksi CPNS atau BUMN. Segmen sekunder: komunitas belajar dan grup persiapan tes di media sosial."
                },
                {
                    "tag": "value_propositions",
                    "content": "Bimbel online persiapan CPNS dan BUMN dengan try out berkala, bank soal terupdate, pembahasan video, dan kelas live interaktif."
                },
                {
                    "tag": "channels",
                    "content": "Platform belajar online, media sosial, webinar gratis, dan kerja sama dengan komunitas kampus serta paguyuban alumni."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Grup diskusi, mentoring online, laporan progres nilai try out, dan layanan konsultasi pemilihan formasi."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Pendapatan dari paket kelas reguler, kelas intensif, paket try out berbayar, dan program privat coaching."
                },
                {
                    "tag": "key_resources",
                    "content": "Tim pengajar berpengalaman, platform belajar, bank soal dan materi, tim teknis, dan brand yang dipercaya."
                },
                {
                    "tag": "key_activities",
                    "content": "Penyusunan materi dan soal, penyelenggaraan kelas live, pengembangan platform, serta pemasaran ke target peserta."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Alumni yang sudah lulus CPNS atau BUMN, komunitas kampus, influencer edukasi, dan penyedia payment gateway."
                },
                {
                    "tag": "cost_structure",
                    "content": "Gaji pengajar dan tim, biaya platform dan server, produksi konten video, marketing digital, dan support pelanggan."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000012"
            ,
            "location": {
                "latitude": 1.4748,
                "longitude": 124.8421,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Penggemar tanaman pemula dan kolektor di Manado yang ingin mempercantik rumah atau kantor. Segmen sekunder: kantor dan kafe yang membutuhkan dekorasi hijau."
                },
                {
                    "tag": "value_propositions",
                    "content": "Toko tanaman hias dengan pilihan tanaman kekinian, media tanam dan pot estetik, konsultasi perawatan, serta workshop urban farming berkala."
                },
                {
                    "tag": "channels",
                    "content": "Toko fisik, media sosial, marketplace lokal, dan kerja sama dengan kafe atau kantor untuk dekorasi dan titip jual."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Konsultasi perawatan gratis, grup komunitas tanaman, pengingat perawatan berkala, dan program poin untuk pembelian berulang."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Penjualan tanaman, pot dan media tanam, biaya workshop, dan jasa dekorasi serta perawatan berkala untuk klien bisnis."
                },
                {
                    "tag": "key_resources",
                    "content": "Greenhouse atau lahan penyimpanan, stok tanaman, tim yang mengerti tanaman, peralatan berkebun, dan jaringan pemasok."
                },
                {
                    "tag": "key_activities",
                    "content": "Perawatan tanaman, pengadaan stok baru, penyelenggaraan workshop, pemasaran, dan kunjungan ke klien bisnis."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Pemasok tanaman dan media tanam, komunitas pecinta tanaman, kafe dan kantor, serta lembaga yang mendukung gerakan hijau."
                },
                {
                    "tag": "cost_structure",
                    "content": "Biaya pembelian tanaman dan media tanam, sewa lahan atau toko, gaji staf, utilitas, dan biaya promosi."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        },
        {
            "_id": "69345c5f1da1df4bf4000013"
            ,
            "location": {
                "latitude": -3.3194,
                "longitude": 114.59,
                "accuracy": 30
            },
            "authorId": "user_36KxgJsnUEJlQuFxLmiO7sdpd91",
            "chatId": "ce815aa2-36f0-4565-bd4b-1402d2a94bbf",
            "isPublic": false,
            "items": [
                {
                    "tag": "customer_segments",
                    "content": "Karyawan kantor di Banjarmasin dengan jadwal padat yang ingin kopi praktis tanpa harus jauh-jauh ke kafe. Segmen sekunder: pengunjung event outdoor dan komunitas hobi."
                },
                {
                    "tag": "value_propositions",
                    "content": "Coffee truck keliling dengan kopi berkualitas, menu minuman cepat saji, mobilitas tinggi ke beberapa titik kantor, dan sistem pre order untuk mengurangi antrean."
                },
                {
                    "tag": "channels",
                    "content": "Truck yang berkeliling di area perkantoran, media sosial untuk pengumuman rute, kerja sama dengan panitia event, dan platform delivery."
                },
                {
                    "tag": "customer_relationships",
                    "content": "Interaksi langsung yang hangat di truck, program stempel atau poin, update jadwal posisi truck, dan respon cepat atas masukan pelanggan."
                },
                {
                    "tag": "revenue_streams",
                    "content": "Penjualan minuman kopi dan non kopi, snack pendamping, paket pesanan untuk rapat kantor, dan fee dari event yang mengundang truck."
                },
                {
                    "tag": "key_resources",
                    "content": "Truk atau mobil food truck, mesin kopi dan peralatan, barista, perizinan usaha keliling, dan brand yang menarik."
                },
                {
                    "tag": "key_activities",
                    "content": "Persiapan dan produksi minuman, mengatur rute harian, pelayanan di lokasi, pemeliharaan kendaraan dan peralatan, serta promosi."
                },
                {
                    "tag": "key_partnerships",
                    "content": "Pemasok kopi dan bahan baku, pengelola gedung perkantoran, panitia event, dan platform delivery online."
                },
                {
                    "tag": "cost_structure",
                    "content": "Cicilan atau sewa truck, pembelian bahan baku, gaji barista, bahan bakar dan perawatan kendaraan, perizinan, dan biaya promosi."
                }
            ],
            "createdAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "updatedAt": {
                "$date": "2025-12-06T16:39:59.512Z"
            },
            "__v": 0
        }
    ];

  console.log('\n🌱 Seeding BMC data...');
  
  // Transform date format from MongoDB JSON export to JavaScript Date and _id to ObjectId
  const transformedData = bmcData.map(item => ({
    ...item,
    _id: new ObjectId(item._id),
    createdAt: new Date(item.createdAt.$date),
    updatedAt: new Date(item.updatedAt.$date)
  }));
  
  // Clear existing data (optional - comment out if you want to keep existing data)
  const existingCount = await BmcPost.countDocuments();
  if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing documents. Clearing collection...`);
    await BmcPost.deleteMany({});
    console.log('✅ Collection cleared');
  }

  // Insert seed data
  const result = await BmcPost.insertMany(transformedData);
  console.log(`✅ Successfully inserted ${result.length} BMC posts`);

  // Show collection stats
  const count = await BmcPost.countDocuments();
  console.log(`\n📊 Total BMC posts in database: ${count}`);

  await mongoose.disconnect();
  console.log('\n🔌 Disconnected from MongoDB');
}

seedBmcData().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});