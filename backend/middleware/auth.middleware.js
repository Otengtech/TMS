import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

export const checkTerminalAccess = async (req, res, next) => {
  try {
    const terminalId = req.params.terminalId || req.body.terminalId;
    
    if (req.user.role === 'superadmin') {
      return next();
    }

    if (req.user.terminalId && req.user.terminalId.toString() === terminalId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: 'You do not have access to this terminal'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Error checking terminal access'
    });
  }
};