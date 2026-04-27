import { pool } from '../config/db.js';

export const getAllProducts = async (options = {}) => {
  const { isAdmin = false, category, status = 'active' } = options;

  let whereConditions = [];
  let params = [];

  // Always filter by active status for non-admin users
  if (!isAdmin) {
    whereConditions.push('status = ?');
    params.push(status);
  }

  if (category) {
    whereConditions.push('category = ?');
    params.push(category);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `
      SELECT id, name, price, description, image_url, stock, category, status, added_by, created_at, updated_at
      FROM products
      ${whereClause}
      ORDER BY created_at DESC, id DESC
    `,
    params
  );

  return rows;
};

export const getProductById = async (id) => {
  const [rows] = await pool.execute(
    `
      SELECT id, name, price, description, image_url, stock, category, created_at, updated_at
      FROM products
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] ?? null;
};

export const createProduct = async ({ name, price, description, imageUrl, stock, category }) => {
  const [result] = await pool.execute(
    `
      INSERT INTO products (name, price, description, image_url, stock, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [name, price, description, imageUrl, stock, category]
  );

  return getProductById(result.insertId);
};

export const updateProduct = async (id, { name, price, description, imageUrl, stock, category }) => {
  const [result] = await pool.execute(
    `
      UPDATE products
      SET name = ?, price = ?, description = ?, image_url = ?, stock = ?, category = ?
      WHERE id = ?
    `,
    [name, price, description, imageUrl, stock, category, id]
  );

  if (result.affectedRows === 0) {
    return null;
  }

  return getProductById(id);
};

export const deleteProduct = async (id) => {
  const [result] = await pool.execute('DELETE FROM products WHERE id = ?', [id]);
  return result.affectedRows > 0;
};
