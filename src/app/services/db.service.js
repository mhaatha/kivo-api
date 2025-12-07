import * as dbRepository from '../repositories/db.repository.js';

/**
 * Check database health
 */
export async function checkDatabaseHealth() {
  try {
    await dbRepository.pingDatabase();
    return {
      status: 'ok',
      message: 'Database reachable',
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Database unreachable',
      error: error.message,
    };
  }
}
