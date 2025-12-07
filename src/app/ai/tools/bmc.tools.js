/**
 * BMC Tools Module
 * Tool definitions for BMC-related AI operations using generateObject
 */

import { z } from 'zod';
import { generateObject } from 'ai';
import { BmcPost } from '../../models/bmc.model.js';
import { getAIModel } from '../../config/ai.config.js';
import * as chatService from '../../services/chat.service.js';

// Valid BMC tags
const BMC_TAGS = [
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

// Schema for a single BMC block
const bmcBlockSchema = z.object({
  tag: z.enum(/** @type {[string, ...string[]]} */ (BMC_TAGS)),
  content: z.string().min(10).describe('Detailed description for this BMC block (min 10 chars)'),
});

// Schema for complete BMC structure - used by generateObject
const bmcObjectSchema = z.object({
  customer_segments: z.string().min(10).describe('Target customers: demographics, behaviors, needs'),
  value_propositions: z.string().min(10).describe('Unique value offered to customers'),
  channels: z.string().min(10).describe('How to reach and deliver value to customers'),
  customer_relationships: z.string().min(10).describe('Type of relationship with customers'),
  revenue_streams: z.string().min(10).describe('How the business generates income'),
  key_resources: z.string().min(10).describe('Essential assets needed to operate'),
  key_activities: z.string().min(10).describe('Critical actions to deliver value'),
  key_partnerships: z.string().min(10).describe('Network of partners and suppliers'),
  cost_structure: z.string().min(10).describe('Major costs involved in the business'),
});

// Schema for partial BMC update
const bmcPartialSchema = bmcObjectSchema.partial();

/**
 * Convert BMC object to items array format for database
 */
function bmcObjectToItems(bmcObject) {
  return Object.entries(bmcObject)
    .filter(([_, content]) => content && content.trim().length > 0)
    .map(([tag, content]) => ({ tag, content }));
}

/**
 * Generate BMC object using AI
 */
async function generateBmcObject(businessContext, existingBmc = null) {
  const schema = existingBmc ? bmcPartialSchema : bmcObjectSchema;
  
  const prompt = existingBmc
    ? `Update the following Business Model Canvas based on new context.
       
Current BMC:
${JSON.stringify(existingBmc, null, 2)}

New context/changes:
${businessContext}

Generate updated BMC blocks. Only include blocks that need changes.`
    : `Generate a complete Business Model Canvas based on this business context:

${businessContext}

Create detailed, actionable content for each BMC block based on the conversation context.`;

  console.log(`[BMC] 🤖 generateObject starting...`);
  
  try {
    const result = await generateObject({
      model: getAIModel(),
      schema,
      prompt,
    });
    
    console.log(`[BMC] 🤖 generateObject completed`);
    return result.object;
  } catch (error) {
    console.error(`[BMC] 🤖 generateObject failed:`, error.message);
    throw error;
  }
}

/**
 * Create BMC tools with user and chat context
 */
export function createBmcTools(userId, chatId) {
  return {
    generateAndSaveBMC: {
      description: `Membuat dan menyimpan Business Model Canvas ke database.

KAPAN DIPANGGIL:
- User meminta "buatkan BMC", "simpan BMC", atau setuju dengan "oke", "gas", "lanjut"
- Sudah ada info bisnis dari percakapan

PENTING - Parameter businessContext:
- WAJIB berisi rangkuman LENGKAP ide bisnis dari SELURUH percakapan
- Minimal 50 karakter
- Contoh: "Bisnis coffee shop untuk mahasiswa 18-25 tahun di area kampus. Produk: kopi susu kekinian harga 15-25rb dan snack. Revenue dari penjualan langsung. Target 100 cup/hari."

JANGAN panggil dengan businessContext kosong!`,
      parameters: z.object({
        businessContext: z
          .string()
          .min(50)
          .describe('WAJIB ISI: Rangkuman lengkap ide bisnis dari percakapan. Contoh: "Bisnis X untuk target Y dengan produk Z, harga A, revenue dari B"'),
      }),
      execute: async (args) => {
        console.log(`[BMC] 🎯 Generating BMC for user: ${userId}`);
        console.log(`[BMC] 📝 Raw args:`, JSON.stringify(args));
        
        const businessContext = args?.businessContext;
        console.log(`[BMC] 📝 Context length: ${businessContext?.length || 0} chars`);
        console.log(`[BMC] 📝 Context preview: ${businessContext?.substring(0, 100)}...`);

        if (!businessContext || businessContext.length < 50) {
          console.log(`[BMC] ⚠️ Context too short, returning error`);
          return {
            status: 'failed',
            message: 'Business context terlalu pendek. Minimal 50 karakter diperlukan.',
          };
        }

        try {
          // Generate structured BMC using AI
          console.log(`[BMC] 🔄 Calling generateObject...`);
          const bmcObject = await generateBmcObject(businessContext);
          console.log(`[BMC] ✅ Generated ${Object.keys(bmcObject).length} blocks`);

          // Convert to database format
          const items = bmcObjectToItems(bmcObject);

          if (items.length === 0) {
            return {
              status: 'failed',
              message: 'Failed to generate BMC blocks. Please provide more business context.',
            };
          }

          // Get location from chat
          const location = await chatService.getLatestLocationFromChat(chatId);
          console.log(`[BMC] 📍 Location from chat:`, location);

          // Save to database
          const newBmc = new BmcPost({
            location: location || {latitude: -6.212389303808392, longitude: 106.79750324133452, accuracy: 996731.7919034803},
            authorId: userId,
            chatId,
            isPublic: false,
            items,
          });

          const saved = await newBmc.save();
          console.log(`[BMC] 💾 Saved BMC ID: ${saved._id}`);

          return {
            status: 'success',
            bmcId: saved._id.toString(),
            blocksGenerated: items.length,
            message: 'BMC berhasil dibuat dan disimpan.',
          };
        } catch (error) {
          console.error(`[BMC] ❌ Error:`, error.message);
          console.error(`[BMC] ❌ Stack:`, error.stack);
          return {
            status: 'failed',
            message: `Gagal membuat BMC: ${error.message}`,
          };
        }
      },
    },

    updateBMC: {
      description: `Update an existing Business Model Canvas with new information.
Use this when user wants to modify or add details to an existing BMC.
The updateContext should describe what changes or additions to make.`,
      parameters: z.object({
        bmcId: z.string().describe('The BMC ID to update (from previous generateAndSaveBMC result or system info)'),
        updateContext: z
          .string()
          .min(20)
          .describe('Description of changes or new information to incorporate into the BMC.'),
      }),
      execute: async ({ bmcId, updateContext }) => {
        console.log(`[BMC] 🔄 Updating BMC: ${bmcId}`);

        try {
          // Fetch existing BMC
          const existingBmc = await BmcPost.findOne({ _id: bmcId, authorId: userId });
          
          if (!existingBmc) {
            return {
              status: 'failed',
              message: 'BMC tidak ditemukan atau Anda tidak memiliki akses.',
            };
          }

          // Convert existing items to object format
          const existingObject = {};
          for (const item of existingBmc.items) {
            existingObject[item.tag] = item.content;
          }

          // Generate updated BMC
          const updatedObject = await generateBmcObject(updateContext, existingObject);
          console.log(`[BMC] ✅ Updated ${Object.keys(updatedObject).length} blocks`);

          // Merge with existing (updated fields override)
          const mergedObject = { ...existingObject, ...updatedObject };
          const items = bmcObjectToItems(mergedObject);

          // Update in database
          existingBmc.items = items;
          existingBmc.updatedAt = new Date();
          await existingBmc.save();

          console.log(`[BMC] 💾 Updated BMC ID: ${bmcId}`);

          return {
            status: 'success',
            bmcId: bmcId,
            blocksUpdated: Object.keys(updatedObject).length,
            message: 'BMC berhasil diperbarui.',
          };
        } catch (error) {
          console.error(`[BMC] ❌ Error:`, error.message);
          return {
            status: 'failed',
            message: `Gagal memperbarui BMC: ${error.message}`,
          };
        }
      },
    },

    performWebSearch: {
      description: 'Cari data VALID: Regulasi Pajak, Tren Pasar, Statistik, atau Kompetitor.',
      parameters: z.object({
        query: z.string().min(3).describe('Search query (e.g., "Pajak UMKM 2024", "Tren Kopi Jakarta")'),
      }),
      execute: async ({ query }) => {
        try {
          const { createSearchTools } = await import('./search.tools.js');
          const searchTools = createSearchTools();
          return await searchTools.performWebSearch.execute({ query });
        } catch (e) {
          console.error("Search Tool Error:", e);
          return { status: "error", message: "Search unavailable" };
        }
      },
    },

    getCoordinate: {
      description: `Mendapatkan koordinat lokasi user dari chat session.
Gunakan tool ini untuk mengetahui lokasi geografis user saat ini.
Berguna untuk analisis pasar lokal, rekomendasi bisnis berbasis lokasi, atau konteks geografis.
Jika gagal untuk mengetahui lokasi geografis user saat ini, maka berikan rekomendasi bisnis yang terbaik serta kuat`,
      parameters: z.object({}),
      execute: async () => {
        console.log(`[BMC] 📍 Getting coordinate for chat: ${chatId}`);

        try {
          const location = await chatService.getLatestLocationFromChat(chatId);

          if (!location) {
            return {
              status: 'not_found',
              message: 'Lokasi user tidak tersedia dalam chat ini.',
              location: null,
            };
          }

          console.log(`[BMC] 📍 Found location:`, location);

          return {
            status: 'success',
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy,
            },
            message: 'Lokasi user berhasil ditemukan.',
          };
        } catch (error) {
          console.error(`[BMC] ❌ Error getting coordinate:`, error.message);
          return {
            status: 'failed',
            message: `Gagal mendapatkan lokasi: ${error.message}`,
            location: {
              latitude: -6.212389303808392,
              longitude: 106.79750324133452,
              accuracy: 996731.7919034803,
            },
          };
        }
      },
    },
  };
}

// Export schemas for testing
export { bmcObjectSchema, bmcPartialSchema, bmcBlockSchema };
