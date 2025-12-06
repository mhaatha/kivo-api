import { BmcPost } from '../models/bmc.model.js';

/**
 * Get all public BMC posts
 */
export async function getPublicBmcPosts() {
  return BmcPost.find({ isPublic: true }).sort({ createdAt: -1 });
}

/**
 * Get BMC by ID
 */
export async function getBmcById(bmcId) {
  return BmcPost.findById(bmcId);
}

/**
 * Get BMCs by author ID
 */
export async function getBmcsByAuthorId(authorId) {
  return BmcPost.find({ authorId }).sort({ createdAt: -1 });
}

/**
 * Create new BMC
 */
export async function createBmc(authorId, items = [], isPublic = false) {
  const bmcPost = new BmcPost({
    authorId,
    items,
    isPublic,
  });
  return bmcPost.save();
}

/**
 * Update BMC by ID
 */
export async function updateBmcById(bmcId, authorId, items) {
  return BmcPost.findOneAndUpdate(
    { _id: bmcId, authorId },
    { $set: { items, updatedAt: new Date() } },
    { new: true, runValidators: true },
  );
}

/**
 * Delete BMC by ID
 */
export async function deleteBmcById(bmcId, authorId) {
  return BmcPost.findOneAndDelete({ _id: bmcId, authorId });
}

/**
 * Toggle BMC visibility
 */
export async function toggleBmcVisibility(bmcId, authorId) {
  const bmc = await BmcPost.findOne({ _id: bmcId, authorId });
  if (!bmc) return null;
  
  bmc.isPublic = !bmc.isPublic;
  return bmc.save();
}

/**
 * Get latest BMC for user
 */
export async function getLatestBmcForUser(authorId) {
  return BmcPost.findOne({ authorId }).sort({ createdAt: -1 });
}

/**
 * Check if user owns BMC
 */
export function userOwnsBmc(bmc, userId) {
  return bmc && bmc.authorId === userId;
}

/**
 * Get BMC by chat ID
 */
export async function getBmcByChatId(chatId) {
  return BmcPost.findOne({ chatId });
}
