/**
 * BMC Tools Module
 * Tool definitions for BMC-related AI operations
 */

import { z } from 'zod';
import { BmcPost } from '../../models/bmc.model.js';
import { normalizeBmcData } from '../../utils/bmc.utils.js';

// Zod schema for coordinates
const coordinatesSchema = z.object({
  lat: z.number(),
  lon: z.number(),
}).optional().describe('Optional location coordinates');

// Zod schema for BMC item
const bmcItemSchema = z.object({
  tag: z.string().describe(
    'BMC block tag. Use snake_case: customer_segments, value_propositions, channels, customer_relationships, revenue_streams, key_resources, key_activities, key_partnerships, cost_structure'
  ),
  content: z.string().min(1).describe('Content/description for this BMC block'),
});

// Zod schema for BMC data array
const bmcDataSchema = z.array(bmcItemSchema).min(1).describe(
  'Array of BMC blocks. Each block has tag (snake_case) and content'
);

/**
 * Get user coordinates
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Coordinates object
 */
async function getUserCoordinates(userId) {
  console.log(`📍 [LOCATION] Attempting to retrieve coordinates for user: ${userId}`);
  
  // Return default coordinates - frontend can override via request context later
  const defaultCoordinates = {
    lat: -6.212249928667231,
    lon: 106.79734681365301,
    source: 'default'
  };
  
  console.log(`📍 [LOCATION] Returning default coordinates for user: ${userId}`);
  return defaultCoordinates;
}

/**
 * Post new BMC to database
 * @param {Array} bmcData - Array of BMC items
 * @param {Object} coordinates - Optional coordinates
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Result object
 */
async function postBmcToDatabase(bmcData, coordinates, userId) {
  // Default coordinates
  let finalCoord = { lat: -6.212249928667231, lon: 106.79734681365301 };

  // Check if valid coordinates were provided
  if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lon === 'number') {
    finalCoord = { ...finalCoord, ...coordinates };
    console.log('📍 [POST] Using detected coordinates:', finalCoord);
  } else {
    console.log('📍 [POST] Using DEFAULT coordinates.');
  }

  // Map to Mongoose schema (field 'long' is required)
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
      system_note: 'BMC created. SAVE THIS ID TO MEMORY: ' + savedBmcPost._id.toString(),
      bmcId: savedBmcPost._id.toString(),
    };
  } catch (error) {
    console.error('❌ Error Post BMC:', error);
    return { status: 'failed', message: error.message };
  }
}


/**
 * Update existing BMC in database
 * @param {string} bmcId - The BMC ID to update
 * @param {Array} bmcData - Array of BMC items
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Result object
 */
async function updateBmcToDatabase(bmcId, bmcData, userId) {
  try {
    console.log(`📝 [UPDATE] Updating BMC ID: ${bmcId}. Items: ${bmcData?.length || 0}`);
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

/**
 * Create BMC tools with user context
 * @param {string} userId - The user ID for tool execution context
 * @returns {Object} - Object containing all BMC-related tools
 */
export function createBmcTools(userId) {
  return {
    getUserCoordinates: {
      description: 'Get user location coordinates. Optional - call this if you want to include location data in BMC.',
      parameters: z.object({}),
      execute: async () => {
        console.log(`[EXEC] ⚙️ getUserCoordinates for user: ${userId}`);
        const result = await getUserCoordinates(userId);
        console.log(`[EXEC] ⚙️ getUserCoordinates result:`, result);
        return result;
      },
    },
    postBmcToDatabase: {
      description: 'Save a new BMC to database. REQUIRED: bmcData array with at least one block. Example: bmcData: [{tag: "customer_segments", content: "Young professionals aged 25-35"}]',
      parameters: z.object({
        coordinates: coordinatesSchema,
        bmcData: bmcDataSchema,
      }),
      execute: async ({ bmcData, coordinates }) => {
        console.log(`[EXEC] ⚙️ postBmcToDatabase with ${bmcData?.length} items`);
        console.log(`[EXEC] ⚙️ bmcData:`, JSON.stringify(bmcData));
        console.log(`[EXEC] ⚙️ Coordinates:`, coordinates || 'using default');
        
        // Validate bmcData before calling service
        if (!bmcData || !Array.isArray(bmcData) || bmcData.length === 0) {
          console.error(`[EXEC] ❌ bmcData is empty or invalid`);
          return {
            status: 'failed',
            message: 'bmcData is required. Provide at least one BMC block with tag and content.',
            example: { tag: 'customer_segments', content: 'Your target customer description' },
          };
        }
        
        const result = await postBmcToDatabase(bmcData, coordinates, userId);
        console.log(`[EXEC] ⚙️ postBmcToDatabase result:`, result);
        return result;
      },
    },
    updateBmcToDatabase: {
      description: 'Update existing BMC with new or modified blocks. Use the bmcId from previous postBmcToDatabase result or from system info.',
      parameters: z.object({
        bmcId: z.string().describe('The BMC ID to update (from postBmcToDatabase result or system info)'),
        bmcData: bmcDataSchema,
      }),
      execute: async ({ bmcId, bmcData }) => {
        console.log(`[EXEC] ⚙️ updateBmcToDatabase ID: ${bmcId}, items: ${bmcData?.length}`);
        const result = await updateBmcToDatabase(bmcId, bmcData, userId);
        console.log(`[EXEC] ⚙️ updateBmcToDatabase result:`, result);
        return result;
      },
    },
  };
}

// Export schemas for testing
export { coordinatesSchema, bmcItemSchema, bmcDataSchema };
