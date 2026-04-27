import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { createUser, countUsers, findUserByEmail } from '../models/userModel.js';

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const createToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, email: user.email }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const register = async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const requestedRole = String(req.body?.role || '').trim().toLowerCase();

  if (!name || !email || !password) {
    return res.status(400).json({ ok: false, error: 'Name, email, and password are required.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Please provide a valid email address.' });
  }

  if (password.length < 6) {
    return res.status(400).json({
      ok: false,
      error: 'Password must be at least 6 characters long.',
    });
  }

  try {
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ ok: false, error: 'An account with this email already exists.' });
    }

    const totalUsers = await countUsers();
    const role = totalUsers === 0 && requestedRole === 'admin' ? 'admin' : 'user';
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await createUser({
      name,
      email,
      password: passwordHash,
      role,
    });

    const user = { id: userId, name, email, role };

    return res.status(201).json({
      ok: true,
      token: createToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Failed to register user:', error);
    return res.status(500).json({ ok: false, error: 'Failed to register user.' });
  }
};

export const login = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ ok: false, error: 'Email and password are required.' });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    return res.json({
      ok: true,
      token: createToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Failed to login user:', error);
    return res.status(500).json({ ok: false, error: 'Failed to login user.' });
  }
};

export const adminLogin = async (req, res) => {
  const password = String(req.body?.password || '');
  const adminEmail = (config.adminSeed.email || 'admin@svelights.com').toLowerCase();
  const adminName = config.adminSeed.name || 'Admin';
  const expectedPassword = config.adminSeed.password || 'admin123';

  if (!password) {
    return res.status(400).json({ ok: false, error: 'Password is required.' });
  }

  if (password !== expectedPassword) {
    return res.status(401).json({ ok: false, error: 'Invalid password.' });
  }

  try {
    let adminUser = await findUserByEmail(adminEmail);

    if (!adminUser) {
      const passwordHash = await bcrypt.hash(expectedPassword, 10);
      const userId = await createUser({
        name: adminName,
        email: adminEmail,
        password: passwordHash,
        role: 'admin',
      });

      adminUser = {
        id: userId,
        name: adminName,
        email: adminEmail,
        password: passwordHash,
        role: 'admin',
      };
    }

    if (adminUser.role !== 'admin') {
      return res.status(403).json({ ok: false, error: 'Configured admin account is not an admin.' });
    }

    return res.json({
      ok: true,
      token: createToken(adminUser),
      user: sanitizeUser(adminUser),
    });
  } catch (error) {
    console.error('Failed to login admin user:', error);
    return res.status(500).json({ ok: false, error: 'Failed to login admin user.' });
  }
};
