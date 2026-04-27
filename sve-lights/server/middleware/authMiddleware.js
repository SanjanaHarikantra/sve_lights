import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { findUserById } from '../models/userModel.js';

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, error: 'Authorization token is required.' });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await findUserById(decoded.id);
    const adminEmail = (config.adminSeed.email || 'admin@svelights.com').toLowerCase();

    if (!user && decoded?.role === 'admin' && String(decoded?.email || '').toLowerCase() === adminEmail) {
      req.user = {
        id: Number(decoded.id) || 0,
        name: config.adminSeed.name || 'Admin',
        email: adminEmail,
        role: 'admin',
      };
      return next();
    }

    if (!user) {
      return res.status(401).json({ ok: false, error: 'User no longer exists.' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ ok: false, error: 'Invalid or expired token.' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Admin access is required.' });
  }

  return next();
};
