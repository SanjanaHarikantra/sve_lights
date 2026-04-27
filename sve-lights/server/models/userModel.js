import { pool } from '../config/db.js';

export const createUser = async ({ name, email, password, role }) => {
  const [result] = await pool.execute(
    `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `,
    [name, email, password, role]
  );

  return result.insertId;
};

export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    `
      SELECT id, name, email, password, role
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email]
  );

  return rows[0] ?? null;
};

export const findUserById = async (id) => {
  const [rows] = await pool.execute(
    `
      SELECT id, name, email, role
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] ?? null;
};

export const countUsers = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM users');
  return Number(rows[0]?.total || 0);
};
