import express from 'express';
import {
  getTerminals,
  getTerminal,
  createTerminal,
  updateTerminal,
  deleteTerminal,
  getTerminalStats
} from '../controllers/terminal.controller.js';
import { protect, authorize, checkTerminalAccess } from '../middleware/auth.middleware.js';
import { validateTerminal } from '../middleware/validation.middleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getTerminals)
  .post(authorize('superadmin'), validateTerminal, createTerminal);

router.get('/:id/stats', checkTerminalAccess, getTerminalStats);

router.route('/:id')
  .get(checkTerminalAccess, getTerminal)
  .put(authorize('superadmin'), validateTerminal, updateTerminal)
  .delete(authorize('superadmin'), deleteTerminal);

export default router;