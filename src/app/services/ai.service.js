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
2.  **JANGAN** pernah menyebutkan kata-kata teknis internal seperti: "Database", "JSON", "Prompt", "Algoritma", "Update data", "Simpan data", atau "Instruksi".
3.  **JANGAN** pernah berkata "Saya telah menyimpan data Customer Segment Anda".
    * *Ganti dengan:* "Oke, target audiensnya jelas. Lanjut, gimana cara kita bikin mereka loyal?"
4.  **JANGAN** menjelaskan batasan sistem Anda (misal: "Maaf saya diprogram untuk tidak menjawab coding").
    * *Ganti dengan alasan manusiawi:* "Waduh, urusan coding biar tim tech aja yang pusing. Saya fokus di strateginya biar bisnis ini cuan."

### 3. STRICT TOPIC GUARDRAILS (NATURAL REDIRECTION)
Anda hanya membahas **Bisnis & BMC**. Jika pengguna melenceng, alihkan secara natural layaknya teman yang ingin fokus kerja.

**A. JIKA DIMINTA CODING/TEKNIS:**
* **Respons:** Tolak dengan gaya bahwa itu bukan keahlian Anda ("Strategy Guy"), lalu sambungkan ke aspek bisnis.
* *Contoh:* "Bro, kalau saya yang nulis kodingan, bisa error semua nanti aplikasinya. Kita serahkan ke developernya aja. Tapi secara fitur, ini ngaruh banget ke *Cost Structure* kita gak?"

**B. JIKA DITANYA TOPIK UMUM (Politik/Gosip):**
* **Respons:** Arahkan balik ke relevansi bisnis.
* *Contoh:* "Wah seru tuh isunya, tapi kalau kita bahas itu bisa gak selesai-selesai nih planning bisnisnya. Balik ke *Revenue Stream* tadi, jadi mau langganan atau beli putus?"

### 4. CORE INTELLIGENCE: 9 BMC BLOCKS
Gali data ini lewat obrolan mengalir (jangan interogasi):
1. Customer Segments
2. Value Propositions
3. Channels
4. Customer Relationships
5. Revenue Streams
6. Key Resources
7. Key Activities
8. Key Partnerships
9. Cost Structure

### 5. SILENT DATA LOGIC (CAPTURE AS YOU GO)
Meskipun obrolan santai, otak Anda bekerja mencatat data.
Setiap kali ada info valid BMC:
1.  **Cek State:** Ada "ACTIVE BMC ID"?
2.  **Eksekusi Silent:**
    * *No ID:* Panggil \`postBmcToDatabase\`.
    * *Has ID:* Panggil \`updateBmcToDatabase\`.
3.  **Wajib Kumulatif:** Gabungkan [Data Lama + Data Baru] saat update.
4.  **INVISIBLE:** Proses ini terjadi 100% di latar belakang. User tidak boleh tahu Anda sedang memanggil fungsi.

### 6. CONTOH GAYA BICARA (NATURAL)
* *Salah (Robotik):* "Informasi Value Proposition telah divalidasi. Selanjutnya mohon jelaskan Channels."
* *Benar (Partner):* "Paham, jadi nilai jual utamanya di kecepatan ya. Terus, rencana kamu buat ngenalin ini ke pasar gimana? Lewat medsos atau direct sales?"
`;

// Tool: Web Search
export async function performWebSearch(query) {
  if (!GOOGLE_API_KEY || !GOOGLE_CX) {
    console.log('[Search Tool] Google API not configured');
    return JSON.stringify([{ error: 'Search not configured' }]);
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

    return JSON.stringify(results);
  } catch (error) {
    console.error('❌ Search API Error:', error.message);
    return JSON.stringify([{ error: 'Failed to fetch search data.' }]);
  }
}

// Tool: Create BMC
export async function postBmcToDatabase(bmcData, userId) {
  const DEFAULT_COORDINAT = { lat: 0, long: 0, alt: 0 };
  try {
    console.log('📝 [POST] Creating new BMC. Items:', bmcData?.length || 0);
    if (!bmcData || !Array.isArray(bmcData)) {
      return { status: 'failed', message: 'Invalid data.' };
    }

    const newBmcPost = new BmcPost({
      coordinat: DEFAULT_COORDINAT,
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

// Tool: Update BMC
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
  {
    type: 'function',
    function: {
      name: 'postBmcToDatabase',
      description:
        'Save initial BMC draft to database. Call this IMMEDIATELY after getting the FIRST valid aspect from user (and no bmcId exists).',
      parameters: {
        type: 'object',
        properties: {
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
        required: ['bmcData'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'updateBmcToDatabase',
      description:
        'Update BMC data. Call this whenever new aspects are added. MUST INCLUDE ALL ASPECTS (old + new) in bmcData array.',
      parameters: {
        type: 'object',
        properties: {
          bmcId: {
            type: 'string',
            description: 'MongoDB ID of current BMC document.',
          },
          bmcData: {
            type: 'array',
            description:
              'COMPLETE list (Cumulative) of all BMC aspects (Old + New Data).',
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
      description:
        'Search for factual data, market statistics, or industry trends to validate ideas.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Specific search keywords.' },
        },
        required: ['query'],
      },
    },
  },
];

// Execute tool by name
export async function executeTool(toolName, args, userId) {
  switch (toolName) {
    case 'postBmcToDatabase':
      return await postBmcToDatabase(args.bmcData, userId);
    case 'updateBmcToDatabase':
      return await updateBmcToDatabase(args.bmcId, args.bmcData, userId);
    case 'performWebSearch':
      return await performWebSearch(args.query);
    default:
      return { error: 'Unknown function' };
  }
}

// Get AI chat completion
export async function getChatCompletion(messages, stream = false) {
  return openaiClient.chat.completions.create({
    model: KOLOSAL_MODEL_NAME,
    messages,
    tools: AVAILABLE_TOOLS,
    tool_choice: 'auto',
    stream,
  });
}

// Get streaming chat completion (for final response)
export async function getStreamingCompletion(messages) {
  return openaiClient.chat.completions.create({
    model: KOLOSAL_MODEL_NAME,
    messages,
    stream: true,
  });
}

export { KOLOSAL_MODEL_NAME };
