import { db } from '../utils/mongodb.js';
import { bmcService } from '../services/bmc.service.js';

export const bmcController = {
  async getAllBMCs(req, res) {
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
  },

  async getBMCById(req, res) {
    try {
      const { id } = req.params;

      const data = await bmcService.getBMCById(id);

      res.json({
        message: 'Success get BMC by id',
        data,
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
        detail: err.message,
      });
    }
  },
};
