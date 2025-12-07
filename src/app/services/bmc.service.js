import * as bmcRepository from '../repositories/bmc.repository.js';

/**
 * Get all public BMC posts
 */
export async function getPublicBmcPosts() {
  return bmcRepository.findAll({ isPublic: true });
}

/**
 * Get BMC by ID
 */
export async function getBmcById(bmcId) {
  return bmcRepository.findById(bmcId);
}

/**
 * Get BMCs by author ID
 */
export async function getBmcsByAuthorId(authorId) {
  return bmcRepository.find({ authorId });
}

/**
 * Create new BMC
 */
export async function createBmc(authorId, items = [], isPublic = false) {
  return bmcRepository.create({
    authorId,
    items,
    isPublic,
  });
}

/**
 * Update BMC by ID
 */
export async function updateBmcById(bmcId, authorId, items) {
  return bmcRepository.updateByIdAndAuthor(bmcId, authorId, { items });
}

/**
 * Delete BMC by ID
 */
export async function deleteBmcById(bmcId, authorId) {
  return bmcRepository.deleteByIdAndAuthor(bmcId, authorId);
}

/**
 * Toggle BMC visibility
 */
export async function toggleBmcVisibility(bmcId, authorId) {
  const bmc = await bmcRepository.findOne({ _id: bmcId, authorId });
  if (!bmc) return null;
  
  bmc.isPublic = !bmc.isPublic;
  return bmc.save();
}

/**
 * Get latest BMC for user
 */
export async function getLatestBmcForUser(authorId) {
  return bmcRepository.findOne({ authorId });
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
  return bmcRepository.findOne({ chatId });
}
