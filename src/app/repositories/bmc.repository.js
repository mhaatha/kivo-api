import { BmcPost } from '../models/bmc.model.js';

/**
 * Find all BMC posts with optional filter
 */
export async function findAll(filter = {}) {
  return BmcPost.find(filter).sort({ createdAt: -1 }).lean();
}

/**
 * Find BMC by ID
 */
export async function findById(bmcId) {
  return BmcPost.findById(bmcId).lean();
}

/**
 * Find one BMC by filter
 */
export async function findOne(filter) {
  return BmcPost.findOne(filter).lean();
}

/**
 * Find BMCs by filter
 */
export async function find(filter) {
  return BmcPost.find(filter).sort({ createdAt: -1 }).lean();
}

/**
 * Create new BMC
 */
export async function create(bmcData) {
  const bmcPost = new BmcPost(bmcData);
  return bmcPost.save();
}

/**
 * Update BMC by ID and author
 */
export async function updateByIdAndAuthor(bmcId, authorId, updateData) {
  return BmcPost.findOneAndUpdate(
    { _id: bmcId, authorId },
    { $set: { ...updateData, updatedAt: new Date() } },
    { new: true, runValidators: true }
  );
}

/**
 * Delete BMC by ID and author
 */
export async function deleteByIdAndAuthor(bmcId, authorId) {
  return BmcPost.findOneAndDelete({ _id: bmcId, authorId });
}
