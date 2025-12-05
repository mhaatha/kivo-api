import OpenAI from 'openai';
import axios from 'axios';
import { BmcPost } from '../models/bmc.model.js';

// API Configuration
const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY;
const KOLOSAL_API_ENDPOINT =
  process.env.KOLOSAL_API_ENDPOINT || 'https://api.kolosal.ai/v1';
const KOLOSAL_MODEL_NAME = process.env.KOLOSAL_MODEL_NAME || 'Kimi K2';

// Google Search Configuration
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

// Create OpenAI client with Kolosal endpoint
export const openaiClient = new OpenAI({
  apiKey: KOLOSAL_API_KEY,
  baseURL: KOLOSAL_API_ENDPOINT,
});

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

### 5. SILENT DATA LOGIC (CAPTURE & LOCATION AWARENESS)
Meskipun obrolan santai, otak Anda bekerja mencatat data.
Setiap kali ada info valid BMC dan perlu disimpan (Create New):

**LANGKAH KRUSIAL (URUTAN EKSEKUSI):**
1. **Cek Lokasi Dulu:** Sebelum membuat BMC baru, Anda WAJIB memanggil tool \`getUserCoordinates\` untuk mendapatkan lokasi pengguna.
2. **Simpan Data:**
   * Jika \`getUserCoordinates\` BERHASIL: Panggil \`postBmcToDatabase\` dengan menyertakan koordinat yang didapat.
   * Jika \`getUserCoordinates\` GAGAL/ERROR: Panggil \`postBmcToDatabase\` dengan default koordinat (lat: -6.212249928667231, lon: 106.79734681365301).
3. **Update (Jika sudah ada ID):** Langsung panggil \`updateBmcToDatabase\`.

**INVISIBLE:** Proses ini terjadi 100% di latar belakang. User tidak boleh tahu Anda sedang mengecek lokasi atau menyimpan database.

### 6. CONTOH GAYA BICARA (NATURAL)
* *Salah (Robotik):* "Saya sedang mengambil koordinat GPS Anda lalu menyimpan data."
* *Benar (Partner):* "Ide bagus. Lokasi usahanya strategis juga sepertinya. Btw, soal biaya operasional sudah dihitung belum?"
`;

// Tool: Web Search
export async function performWebSearch(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.log('[Search Tool] Google API not configured');
    return JSON.stringify([{ error: 'Search not configured' }]);
  }
  // ... (kode search sama seperti sebelumnya) ...
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
    return JSON.stringify(results);
  } catch (error) {
    console.error('❌ Search API Error:', error.message);
    return JSON.stringify([{ error: 'Failed to fetch search data.' }]);
  }
}

// Tool: Get User Coordinates (NEW FUNCTION)
export async function getUserCoordinates(userId) {
  console.log(`📍 [LOCATION] Attempting to retrieve coordinates for user: ${userId}`);
  
  try {
    // Contoh GAGAL (Default behaviour jika data tidak dikirim frontend):
    throw new Error("Location data not provided by client.");
    
  } catch (error) {
    console.warn(`⚠️ [LOCATION] Failed: ${error.message}. Using defaults.`);
    return JSON.stringify({ error: "Location not found" });
  }
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

  try {
    console.log('📝 [POST] Creating new BMC. Items:', bmcData?.length || 0);
    if (!bmcData || !Array.isArray(bmcData)) {
      return { status: 'failed', message: 'Invalid data.' };
    }

    const newBmcPost = new BmcPost({
      coordinat: finalCoord, // Menggunakan koordinat dinamis
      authorId: userId,
      isPublic: false,
      items: bmcData,
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

    const updatedBmcPost = await BmcPost.findOneAndUpdate(
      { _id: bmcId, authorId: userId },
      { $set: { items: bmcData, updatedAt: new Date() } },
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

// Tool Definitions for OpenAI
export const AVAILABLE_TOOLS = [
  // 1. Tool Baru: Get Coordinates
  {
    type: 'function',
    function: {
      name: 'getUserCoordinates',
      description: 'Retrieve user latitude and longitude from the system/frontend context before creating a BMC.',
      parameters: {
        type: 'object',
        properties: {}, // Tidak butuh parameter input, mengambil dari context userId
      },
    },
  },
  // 2. Tool Update: Post BMC (Sekarang menerima coordinates)
  {
    type: 'function',
    function: {
      name: 'postBmcToDatabase',
      description:
        'Save initial BMC draft. Call getUserCoordinates FIRST. If coordinates found, pass them here. If not, pass default 0,0.',
      parameters: {
        type: 'object',
        properties: {
          coordinates: {
            type: 'object',
            description: 'The lat/lon obtained from getUserCoordinates tool.',
            properties: {
              lat: { type: 'number' },
              lon: { type: 'number' }
            },
            required: ['lat', 'lon']
          },
          bmcData: {
            type: 'array',
            description: 'List of BMC aspect objects identified so far.',
            items: {
              type: 'object',
              properties: {
                tag: { type: 'string' },
                content: { type: 'string' },
              },
              required: ['tag', 'content'],
            },
          },
        },
        required: ['bmcData'], // coordinates opsional di level schema JSON, tapi logic prompt menyarankannya
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateBmcToDatabase',
      description:
        'Update BMC data. Call this whenever new aspects are added.',
      parameters: {
        type: 'object',
        properties: {
          bmcId: { type: 'string' },
          bmcData: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tag: { type: 'string' },
                content: { type: 'string' },
              },
              required: ['tag', 'content'],
            },
          },
        },
        required: ['bmcId', 'bmcData'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'performWebSearch',
      description: 'Search for factual data.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
        },
        required: ['query'],
      },
    },
  },
];

// Execute tool by name
export async function executeTool(toolName, args, userId) {
  switch (toolName) {
    case 'getUserCoordinates':
        return await getUserCoordinates(userId);
    case 'postBmcToDatabase':
      // Mapping args.coordinates ke fungsi
      return await postBmcToDatabase(args.bmcData, args.coordinates, userId);
    case 'updateBmcToDatabase':
      return await updateBmcToDatabase(args.bmcId, args.bmcData, userId);
    case 'performWebSearch':
      return await performWebSearch(args.query);
    default:
      return { error: 'Unknown function' };
  }
}

// ... (Sisa fungsi getChatCompletion dll sama) ...
export async function getChatCompletion(messages, stream = false) {
  return openaiClient.chat.completions.create({
    model: KOLOSAL_MODEL_NAME,
    messages,
    tools: AVAILABLE_TOOLS,
    tool_choice: 'auto',
    stream,
  });
}

export async function getStreamingCompletion(messages) {
  return openaiClient.chat.completions.create({
    model: KOLOSAL_MODEL_NAME,
    messages,
    stream: true,
  });
}