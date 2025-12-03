import { bmcRepository } from '../repositories/bmc.repository.js';

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
};
