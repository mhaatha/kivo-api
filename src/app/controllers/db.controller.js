import * as dbService from '../services/db.service.js';

export async function checkDBHealth(req, res) {
  const result = await dbService.checkDatabaseHealth();
  
  if (result.status === 'ok') {
    return res.status(200).json(result);
  } else {
    return res.status(500).json(result);
  }
}
