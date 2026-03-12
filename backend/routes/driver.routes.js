import express from 'express';
import {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
  getExpiredLicenses,
  toggleDriverStatus
} from '../controllers/driver.controller.js';
import { protect, authorize, checkTerminalAccess } from '../middleware/auth.middleware.js';
import { validateDriver } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getDrivers)
  .post(authorize('admin', 'superadmin'), validateDriver, createDriver);

router.get('/expired-licenses', getExpiredLicenses);
router.patch('/:id/toggle-status', toggleDriverStatus)
router.route('/:id')
  .get(getDriver)
  .put(authorize('admin', 'superadmin'), validateDriver, updateDriver)
  .delete(authorize('admin', 'superadmin'), deleteDriver);

export default router;