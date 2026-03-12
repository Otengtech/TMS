import express from 'express';
import {
  getRecords,
  getRecord,
  getTodaysRecords
} from '../controllers/record.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getRecords);
router.get('/today', getTodaysRecords);
router.get('/:id', getRecord);

export default router;