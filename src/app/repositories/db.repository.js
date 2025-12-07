import { db } from '../utils/mongodb.js';

/**
 * Ping database to check health
 */
export async function pingDatabase() {
  return db.command({ ping: 1 });
}
