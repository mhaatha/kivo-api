import axios from 'axios';
import { BmcPost } from '../models/bmc.model.js';

// Google Search Configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

// System prompt for BMC Strategic Partner
export const BMC_SYSTEM_PROMPT = `
### 1. IDENTITY & PERSONA (Rekan Bisnis Strategis)
Anda adalah **Strategic Business Partner & Risk Analyst**.
* **Tone:** Profesional namun kasual/luwes (seperti rekan kerja senior atau co-founder). Tidak kaku, tidak robotik.
* **Mindset:** Kritis, berorientasi solusi, dan tajam dalam melihat celah bisnis.
* **Tugas:** Mengobrol santai untuk mematangkan ide bisnis teman Anda (pengguna) sambil diam-diam menyusun *Business Model Canvas (BMC)*.

### 2. THE FOURTH WALL (ATURAN INVISIBILITAS SISTEM - PENTING)
Anda dilarang keras merusak ilusi percakapan manusia.
1.  **JANGAN** pernah menyebut diri Anda sebagai AI, Bot, Sistem, Model Bahasa, atau Aplikasi.
2.  **JANGAN** pernah menyebutkan kata-kata teknis internal seperti: "Database", "JSON", "Prompt", "Algoritma", "Update data", "Simpan data", "Lat/Long", atau "Instruksi".
3.  **JANGAN** pernah berkata "Saya telah menyimpan data Customer Segment Anda".
    * *Ganti dengan:* "Oke, target audiensnya jelas. Lanjut, gimana cara kita bikin mereka loyal?"
4.  **JANGAN** menjelaskan batasan sistem Anda.

### 3. STRICT TOPIC GUARDRAILS (NATURAL REDIRECTION)
Anda hanya membahas **Bisnis & BMC**. Jika pengguna melenceng, alihkan secara natural layaknya teman yang ingin fokus kerja.

### 4. CORE INTELLIGENCE: 9 BMC BLOCKS
Gali data ini lewat obrolan mengalir:
1. Customer Segments
2. Value Propositions
3. Channels
4. Customer Relationships
5. Revenue Streams
6. Key Resources
7. Key Activities
8. Key Partnerships
9. Cost Structure

### 5. TOOL CALLING RULES (PENTING!)
Ketika user meminta untuk membuat/menyimpan BMC, Anda HARUS memanggil tool dengan data yang sudah dikumpulkan dari percakapan.

**CARA MENYIMPAN BMC BARU:**
Panggil \`postBmcToDatabase\` dengan parameter bmcData yang berisi array BMC blocks.
Contoh pemanggilan yang BENAR:
\`\`\`
postBmcToDatabase({
  bmcData: [
    { tag: "customer_segments", content: "Anak muda usia 18-25 tahun yang suka kopi" },
    { tag: "value_propositions", content: "Kopi berkualitas dengan harga terjangkau" }
  ]
})
\`\`\`

**TAG YANG VALID:** customer_segments, value_propositions, channels, customer_relationships, revenue_streams, key_resources, key_activities, key_partnerships, cost_structure

**CARA UPDATE BMC:**
Jika sudah ada BMC ID di system info, panggil \`updateBmcToDatabase\` dengan bmcId dan bmcData lengkap.

**PENTING:** Selalu isi bmcData dengan informasi yang sudah dibahas dalam percakapan. JANGAN panggil tool dengan bmcData kosong!

### 6. CONTOH GAYA BICARA (NATURAL)
* *Salah (Robotik):* "Saya sedang mengambil koordinat GPS Anda lalu menyimpan data."
* *Benar (Partner):* "Ide bagus. Lokasi usahanya strategis juga sepertinya. Btw, soal biaya operasional sudah dihitung belum?"
`;

// Tool: Web Search
export async function performWebSearch(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.log('[Search Tool] Google API not configured');
    return { status: 'error', message: 'Search not configured', results: [] };
  }
  
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`;
  try {
    console.log(`[Search Tool] 🔎 Searching: ${query}`);
    const response = await axios.get(url);
    const results = response.data.items
      ? response.data.items.slice(0, 4).map((item) => ({
          title: item.title,
          snippet: item.snippet,
          link: item.link,
        }))
      : [];
    return { status: 'success', query, results };
  } catch (error) {
    console.error('❌ Search API Error:', error.message);
    return { status: 'error', message: error.message, results: [] };
  }
}

// Tool: Get User Coordinates (NEW FUNCTION)
export async function getUserCoordinates(userId) {
  console.log(`📍 [LOCATION] Attempting to retrieve coordinates for user: ${userId}`);
  
  // Return default coordinates - frontend bisa override via request context nanti
  // Untuk sekarang, return default agar tool chain tidak break
  const defaultCoordinates = {
    lat: -6.212249928667231,
    lon: 106.79734681365301,
    source: 'default'
  };
  
  console.log(`📍 [LOCATION] Returning default coordinates for user: ${userId}`);
  return defaultCoordinates;
}

// Valid BMC tags (snake_case)
const VALID_BMC_TAGS = [
  'customer_segments',
  'value_propositions',
  'channels',
  'customer_relationships',
  'revenue_streams',
  'key_resources',
  'key_activities',
  'key_partnerships',
  'cost_structure',
];

// Helper: Normalize tag to snake_case
function normalizeTag(tag) {
  if (!tag) return tag;
  // Convert camelCase/PascalCase to snake_case
  const snakeCase = tag
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
  return VALID_BMC_TAGS.includes(snakeCase) ? snakeCase : tag;
}

// Helper: Normalize bmcData tags
function normalizeBmcData(bmcData) {
  if (!Array.isArray(bmcData)) return bmcData;
  return bmcData.map((item) => ({
    ...item,
    tag: normalizeTag(item.tag),
  }));
}

// Tool: Create BMC (UPDATED with Coordinates)
export async function postBmcToDatabase(bmcData, coordinates, userId) {
  // Koordinat default
  let finalCoord = { lat: -6.212249928667231, lon: 106.79734681365301 };

  // Cek apakah koordinat valid dikirim dari tool getUserCoordinates
  if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lon === 'number') {
    finalCoord = { ...finalCoord, ...coordinates };
    console.log('📍 [POST] Using detected coordinates:', finalCoord);
  } else {
    console.log('📍 [POST] Using DEFAULT coordinates (0,0).');
  }

  // Map ke schema Mongoose (field 'long' diperlukan)
  const coordForModel = { lat: finalCoord.lat, long: finalCoord.lon };

  try {
    console.log('📝 [POST] Creating new BMC. Items:', bmcData?.length || 0);
    if (!bmcData || !Array.isArray(bmcData)) {
      return { status: 'failed', message: 'Invalid data.' };
    }

    // Normalize tags to snake_case
    const normalizedData = normalizeBmcData(bmcData);
    console.log('📝 [POST] Normalized tags:', normalizedData.map((i) => i.tag));

    const newBmcPost = new BmcPost({
      coordinat: coordForModel,
      authorId: userId,
      isPublic: false,
      items: normalizedData,
    });

    const savedBmcPost = await newBmcPost.save();
    console.log('✅ [POST] Success. ID:', savedBmcPost._id);

    return {
      status: 'success',
      system_note:
        'BMC created. SAVE THIS ID TO MEMORY: ' + savedBmcPost._id.toString(),
      bmcId: savedBmcPost._id.toString(),
    };
  } catch (error) {
    console.error('❌ Error Post BMC:', error);
    return { status: 'failed', message: error.message };
  }
}

// Tool: Update BMC (Sama seperti sebelumnya)
export async function updateBmcToDatabase(bmcId, bmcData, userId) {
  try {
    console.log(
      `📝 [UPDATE] Updating BMC ID: ${bmcId}. Items: ${bmcData?.length || 0}`,
    );
    if (!bmcId) return { status: 'failed', message: 'BMC ID required.' };
    if (!bmcData || !Array.isArray(bmcData)) {
      return { status: 'failed', message: 'BMC data empty.' };
    }

    // Normalize tags to snake_case
    const normalizedData = normalizeBmcData(bmcData);
    console.log('📝 [UPDATE] Normalized tags:', normalizedData.map((i) => i.tag));

    const updatedBmcPost = await BmcPost.findOneAndUpdate(
      { _id: bmcId, authorId: userId },
      { $set: { items: normalizedData, updatedAt: new Date() } },
      { new: true, runValidators: true },
    );

    if (!updatedBmcPost) {
      return { status: 'failed', message: 'BMC not found or unauthorized.' };
    }

    console.log('✅ [UPDATE] Success.');
    return {
      status: 'success',
      system_note: 'BMC data updated successfully.',
      bmcId: updatedBmcPost._id.toString(),
    };
  } catch (error) {
    console.error('❌ Error Update BMC:', error);
    return { status: 'failed', message: error.message };
  }
}

