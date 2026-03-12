import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { validateUser } from '../middleware/validation.middleware.js';

const router = express.Router();

// All user routes require authentication and superadmin role
router.use(protect);
router.use(authorize('superadmin'));

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUser)
  .put(validateUser, updateUser)
  .delete(deleteUser);

export default router;