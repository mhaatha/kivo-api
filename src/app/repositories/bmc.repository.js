import { db } from '../utils/mongodb.js';

export const bmcRepository = {
  async findAll(filter = {}) {
    return db.collection('bmc').find(filter).toArray();
  },
};
