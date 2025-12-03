import { db } from '../utils/mongodb.js';
import { ObjectId } from 'mongodb';

export const bmcRepository = {
  async findAll(filter = {}) {
    return db.collection('bmc').find(filter).toArray();
  },

  async findById(id) {
    return db.collection('bmc').findOne({
      id: new ObjectId(id),
    });
  },
};
