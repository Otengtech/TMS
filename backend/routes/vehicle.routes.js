import express from 'express';
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  checkInVehicle,
  checkOutVehicle,
  getCheckedInVehicles
} from '../controllers/vehicle.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateVehicle, validateCheckInOut } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getVehicles)
  .post(authorize('admin', 'superadmin'), validateVehicle, createVehicle);

router.get('/checked-in', getCheckedInVehicles);

router.post('/check-in', authorize('admin', 'superadmin'), validateCheckInOut, checkInVehicle);
router.post('/check-out', authorize('admin', 'superadmin'), validateCheckInOut, checkOutVehicle);

router.route('/:id')
  .get(getVehicle)
  .put(authorize('admin', 'superadmin'), updateVehicle)
  .delete(authorize('admin', 'superadmin'), deleteVehicle);

export default router;