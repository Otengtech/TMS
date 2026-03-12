import express from 'express';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateUser, validateLogin } from '../middleware/validation.middleware.js';

const router = express.Router();

router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);

export default router;