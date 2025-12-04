import { db } from '../utils/mongodb.js';
import { ObjectId } from 'mongodb';

export const bmcRepository = {
  async findAll(filter = {}) {
    return db.collection('bmcposts').find(filter).toArray();
  },

  async findById(id) {
    return db.collection('bmcposts').findOne({
      id: new ObjectId(id),
    });
  },
};
