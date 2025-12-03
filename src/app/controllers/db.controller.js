import { db } from '../utils/mongodb.js';

export async function checkDBHealth(req, res) {
  try {
    await db.command({ ping: 1 });
    res.status(200).json({ status: 'ok', message: 'Database reachable' });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Database unreachable',
      error: err.message,
    });
  }
}
