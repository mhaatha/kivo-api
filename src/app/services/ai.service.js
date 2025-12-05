import OpenAI from 'openai';
import axios from 'axios';
import mongoose from 'mongoose';
import { BmcPost } from '../models/bmc.model.js'; 

// --- CONFIGURATION ---
const KOLOSAL_API_KEY = process.env.KOLOSAL_API_KEY;
const KOLOSAL_API_ENDPOINT = process.env.KOLOSAL_API_ENDPOINT || 'https://api.kolosal.ai/v1';
const KOLOSAL_MODEL_NAME = process.env.KOLOSAL_MODEL_NAME || 'Kimi K2'; 
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_CX = process.env.GOOGLE_CX;

export const openaiClient = new OpenAI({
  apiKey: KOLOSAL_API_KEY,
  baseURL: KOLOSAL_API_ENDPOINT,
});

// --- IMPROVED SYSTEM PROMPT ---
export const BMC_SYSTEM_PROMPT = `
### 1. IDENTITY & MISSION
Anda adalah **Strategic Business Partner**.
* **Tugas Utama:** Berdiskusi santai untuk mematangkan ide bisnis User, DAN **WAJIB** mencatat poin-poin penting ke dalam Database BMC secara otomatis.
* **Mindset:** Jangan hanya memberi saran. Anda adalah "Notulen Cerdas" yang mencatat ide User ke dalam struktur data tanpa disuruh.

### 2. TRIGGER TOOL (SANGAT PENTING)
Setiap kali User membicarakan ide bisnis, strategi, harga, atau target pasar, Anda **HARUS** memanggil function (tool).
* **JANGAN** menunggu User meminta "simpan ini".
* **JANGAN** hanya membalas dengan teks panjang. Lakukan *Action* penyimpanan data bersamaan dengan balasan Anda.

### 3. DATABASE LOGIC (ID HANDLING)
1. **Cek History:** Apakah sudah ada **bmcId** di percakapan sebelumnya?
2. **Logic:**
   * **No ID:** Panggil \`postBmcToDatabase\` (Create New).
   * **Has ID:** Panggil \`updateBmcToDatabase\` (Update Existing) dengan ID tersebut.
3. **Strict:** Jangan pernah membuat ID palsu.

### 4. DATA MAPPING (STRICT FORMAT)
Saat mengekstrak data untuk tool \`bmcData\`, gunakan **HANYA** tag berikut (sesuai Schema Database, Tanpa Spasi):

1. **CustomerSegments** (Bukan "Customer Segments")
2. **ValuePropositions**
3. **Channels**
4. **CustomerRelationships**
5. **RevenueStreams**
6. **KeyResources**
7. **KeyActivities**
8. **KeyPartnerships**
9. **CostStructure**

Contoh pemetaan yang BENAR untuk tool:
[{ "tag": "CostStructure", "content": "Modal awal 5 juta untuk booth dan bahan baku." }]

Contoh SALAH (Akan Error):
[{ "tag": "Cost Structure", "content": "..." }] -> (Salah karena ada spasi)

### 5. GAYA BICARA
Profesional, santai, suportif. Jangan menyebut istilah teknis seperti "JSON", "Database", "Tag", atau "Enum".
`;

// --- TOOL FUNCTIONS ---

// 1. Get Coordinates
export async function getUserCoordinates(userId) {
  console.log(`📍 [LOCATION] Retrieving coordinates for user: ${userId}`);
  try {
    const mockCoords = { lat: -6.2088, lon: 106.8456 };
    return JSON.stringify(mockCoords); 
  } catch (error) {
    return JSON.stringify({ error: "Location not found, using default." });
  }
}

// 2. Web Search
export async function performWebSearch(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    // console.warn("⚠️ Google Search belum dikonfigurasi.");
    return JSON.stringify([{ error: 'Search functionality disabled.' }]);
  }
  
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}`;
  
  try {
    console.log(`🔎 [SEARCH] "${query}"`);
    const response = await axios.get(url, { timeout: 5000 });
    
    if (!response.data.items) return JSON.stringify([{ message: "No results found." }]);

    const results = response.data.items.slice(0, 3).map((item) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link,
      }));
    return JSON.stringify(results);
  } catch (error) {
    console.error(`❌ [SEARCH ERROR] ${error.message}`);
    return JSON.stringify([{ error: 'Failed to retrieve search results.' }]);
  }
}

// 3. Post BMC (Create New)
export async function postBmcToDatabase(bmcData, coordinates, userId) {
  let finalCoord = { lat: -6.212249928667231, lon: 106.79734681365301 };

  if (coordinates && typeof coordinates === 'object') {
    if (typeof coordinates.lat === 'number' && typeof coordinates.lon === 'number') {
      finalCoord = { lat: coordinates.lat, lon: coordinates.lon };
    }
  }

  try {
    console.log('📝 [POST] Creating BMC items:', bmcData?.length || 0);

    const newBmcPost = new BmcPost({
      coordinate: finalCoord, 
      authorId: userId,
      isPublic: false,
      items: Array.isArray(bmcData) ? bmcData : [], 
    });

    const savedBmcPost = await newBmcPost.save();
    console.log('✅ [POST] Success. ID:', savedBmcPost._id);

    return {
      status: 'success',
      system_note: `BMC created successfully with ID: ${savedBmcPost._id.toString()}. You MUST use this ID for any future updates in this session.`,
      bmcId: savedBmcPost._id.toString(), 
    };
  } catch (error) {
    console.error('❌ Error Post BMC:', error.message);
    // Return detail error ke AI supaya dia tahu kalau salah format tag
    return { status: 'failed', message: `Database Validation Error: ${error.message}. Ensure tags match the strict enum list (e.g. 'CostStructure', no spaces).` };
  }
}

// 4. Update BMC
export async function updateBmcToDatabase(bmcId, bmcData, userId) {
  try {
    console.log(`📝 [UPDATE] Attempting update for ID: ${bmcId}`);
    
    if (!bmcId || !mongoose.Types.ObjectId.isValid(bmcId)) {
       console.warn(`⚠️ [UPDATE REJECTED] Invalid ID format: ${bmcId}`);
       return { 
         status: 'failed', 
         message: 'ERROR: Invalid MongoDB ID format. Please use postBmcToDatabase to create a new record instead.' 
       };
    }
    
    const updatedBmcPost = await BmcPost.findOneAndUpdate(
      { _id: bmcId, authorId: userId },
      { 
        $push: { items: { $each: Array.isArray(bmcData) ? bmcData : [] } }, 
        $set: { updatedAt: new Date() } 
      },
      { new: true, runValidators: true } // runValidators penting agar error enum terdeteksi
    );

    if (!updatedBmcPost) {
        return { status: 'failed', message: 'BMC Document not found.' };
    }

    console.log('✅ [UPDATE] Success. Items added:', bmcData.length);
    return {
      status: 'success',
      bmcId: updatedBmcPost._id.toString(),
      item_count: updatedBmcPost.items.length
    };
  } catch (error) {
    console.error('❌ Error Update BMC:', error.message);
    return { status: 'failed', message: `Database Validation Error: ${error.message}. Ensure tags match the strict enum list.` };
  }
}


// --- TOOL DEFINITIONS (SCHEMA) ---
// PERBAIKAN: Menambahkan enum eksplisit di definisi tool agar AI tidak salah ketik
const BMC_TAGS_ENUM = [
  'CustomerSegments',
  'ValuePropositions',
  'Channels',
  'CustomerRelationships',
  'RevenueStreams',
  'KeyResources',
  'KeyActivities',
  'KeyPartnerships',
  'CostStructure'
];

export const AVAILABLE_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'getUserCoordinates',
      description: 'Get user lat/lon coordinates to attach location to the BMC.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'postBmcToDatabase',
      description: 'Create a NEW BMC document. Call this whenever new business points are discussed and no BMC ID exists yet.',
      parameters: {
        type: 'object',
        properties: {
          coordinates: {
            type: 'object',
            properties: { lat: { type: 'number' }, lon: { type: 'number' } },
            description: "Coordinates from getUserCoordinates."
          },
          bmcData: {
            type: 'array',
            description: "List of business components extracted from conversation.",
            items: {
              type: 'object',
              properties: { 
                tag: { 
                  type: 'string', 
                  enum: BMC_TAGS_ENUM, // STRICT ENUM DI SINI
                  description: "Must be one of the strict CamelCase tags (e.g. 'CostStructure'). Do not use spaces."
                }, 
                content: { type: 'string' } 
              },
              required: ['tag', 'content'],
            },
          },
        },
        required: ['bmcData'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateBmcToDatabase',
      description: 'Append items to an EXISTING BMC. REQUIRES a valid 24-char hex ID.',
      parameters: {
        type: 'object',
        properties: {
          bmcId: { type: 'string', description: "The existing MongoDB ID." },
          bmcData: {
            type: 'array',
            items: {
              type: 'object',
              properties: { 
                tag: { 
                  type: 'string', 
                  enum: BMC_TAGS_ENUM, // STRICT ENUM DI SINI
                  description: "Must be one of the strict CamelCase tags."
                }, 
                content: { type: 'string' } 
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
      description: 'Search Google for market facts.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
    },
  },
];

// --- EXECUTOR ---
export async function executeTool(toolName, args, userId, clientCoordinates) {
  const safeArgs = args || {};
  
  switch (toolName) {
    case 'getUserCoordinates': 
        return await getUserCoordinates(userId);
    case 'postBmcToDatabase': 
        // Menggunakan clientCoordinates yang dipassing dari Controller
        return await postBmcToDatabase(safeArgs.bmcData, clientCoordinates, userId);
    case 'updateBmcToDatabase': 
        return await updateBmcToDatabase(safeArgs.bmcId, safeArgs.bmcData, userId);
    case 'performWebSearch': 
        return await performWebSearch(safeArgs.query);
    default: 
        return JSON.stringify({ error: `Function ${toolName} not found` });
  }
}

export async function getChatCompletion(messages, stream = false) {
  return openaiClient.chat.completions.create({
    model: KOLOSAL_MODEL_NAME,
    messages,
    tools: AVAILABLE_TOOLS,
    tool_choice: 'auto', // Bisa diubah ke 'required' jika ingin memaksa, tapi 'auto' biasanya cukup dengan prompt yang kuat
    stream,
  });
}

export async function getStreamingCompletion(messages) {
  return getChatCompletion(messages, true);
}