import { db } from '../utils/mongodb.js';
import { bmcService } from '../services/bmc.service.js';

export async function getAllBMCs(req, res) {
  try {
    const { is_public } = req.query;
    const data = await bmcService.getAllBMCs();

    res.status(200).json({
      message: 'Success get all BMCs',
      data,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      detail: err.message,
    });
  }
}
