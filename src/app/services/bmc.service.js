import { bmcRepository } from '../repositories/bmc.repository.js';
import { ObjectId } from 'mongodb';

export const bmcService = {
  async getAllBMCs(isPublicQuery) {
    let filter = {};

    // If query param exists → use it
    // Otherwise default: is_public = true
    if (typeof isPublicQuery !== 'undefined') {
      const parsed = isPublicQuery === 'true';
      filter.is_public = parsed;
    } else {
      filter.is_public = true;
    }

    return bmcRepository.findAll(filter);
  },

  async getBMCById(id) {
    // Validate ID
    if (!ObjectId.isValid(id)) {
      throw new Error('error: Invalid BMC ID');
    }

    const result = await bmcRepository.findById(id);

    if (!result) {
      throw new Error('BMC not found');
    }

    return result;
  },
};
