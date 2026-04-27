import express from 'express';
import { pool } from '../config/db.js';
import { requireAdmin, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const normalizeCollection = (row) => ({
  id: row.id,
  productName: row.product_name,
  description: row.description,
  price: Number(row.price).toFixed(2),
  image: row.image,
  category: row.category,
  marketplace: row.source_platform || '',
  productUrl: row.source_url || '',
  stock: Math.max(0, Number(row.stock) || 0),
  stockStatus: Number(row.stock) > 0 ? 'In Stock' : 'Out of Stock',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeFeedback = (row) => ({
  id: row.id,
  service: row.service,
  rating: Number(row.rating),
  message: row.message,
  createdAt: row.created_at,
});

const toSafePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

router.post('/feedback', async (req, res) => {
  const { service, rating, message } = req.body ?? {};

  if (!service || !rating || !message?.trim()) {
    return res.status(400).json({
      ok: false,
      error: 'Service, rating, and message are required.',
    });
  }

  try {
    const [result] = await pool.execute(
      `
        INSERT INTO feedback (service, rating, message)
        VALUES (?, ?, ?)
      `,
      [service, Number(rating), message.trim()]
    );

    return res.status(201).json({
      ok: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to save feedback.',
    });
  }
});

router.get('/feedback', async (req, res) => {
  const page = toSafePositiveInt(req.query.page, 1);
  const limit = Math.min(toSafePositiveInt(req.query.limit, 6), 20);
  const offset = (page - 1) * limit;

  try {
    const [rows] = await pool.query(
      `
        SELECT id, service, rating, message, created_at
        FROM feedback
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?
      `,
      [limit + 1, offset]
    );

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    return res.json({
      ok: true,
      feedback: pageRows.map(normalizeFeedback),
      pagination: {
        page,
        limit,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Failed to fetch feedback:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch feedback.',
    });
  }
});

router.post('/project-enquiries', async (req, res) => {
  const { name, email, phone, message } = req.body ?? {};

  if (!name?.trim() || !email?.trim() || !phone?.trim()) {
    return res.status(400).json({
      ok: false,
      error: 'Name, email, and phone are required.',
    });
  }

  try {
    const [result] = await pool.execute(
      `
        INSERT INTO project_enquiries (name, email, phone, message)
        VALUES (?, ?, ?, ?)
      `,
      [name.trim(), email.trim(), phone.trim(), message?.trim() || '']
    );

    return res.status(201).json({
      ok: true,
      id: result.insertId,
    });
  } catch (error) {
    console.error('Failed to save project enquiry:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to save project enquiry.',
    });
  }
});

router.get('/collections', async (req, res) => {
  const page = toSafePositiveInt(req.query.page, 1);
  const limit = Math.min(toSafePositiveInt(req.query.limit, 12), 50);
  const offset = (page - 1) * limit;
  const type = String(req.query.type ?? '').trim();
  const search = String(req.query.search ?? '').trim();

  const whereConditions = [];
  const whereParams = [];

  if (type) {
    whereConditions.push('category = ?');
    whereParams.push(type);
  }

  if (search) {
    whereConditions.push(
      '(product_name LIKE ? OR description LIKE ? OR source_platform LIKE ?)'
    );
    const likeValue = `%${search}%`;
    whereParams.push(likeValue, likeValue, likeValue);
  }

  const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  try {
    const [categoriesRows] = await pool.query(
      `
        SELECT DISTINCT category
        FROM collections
        WHERE category <> ''
        ORDER BY category ASC
      `
    );

    const [rows] = await pool.query(
      `
        SELECT id, product_name, description, price, image, category, source_platform, source_url, created_at, updated_at
        , stock
        FROM collections
        ${whereSql}
        ORDER BY created_at DESC, id DESC
        LIMIT ? OFFSET ?
      `,
      [...whereParams, limit + 1, offset]
    );

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    return res.json({
      ok: true,
      collections: pageRows.map(normalizeCollection),
      categories: categoriesRows.map((row) => row.category),
      pagination: {
        page,
        limit,
        hasMore,
      },
    });
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch collections.',
    });
  }
});

router.post('/collections', verifyToken, requireAdmin, async (req, res) => {
  const { productName, description, price, image, category, marketplace, productUrl, stock } = req.body ?? {};

  if (!productName?.trim() || !description?.trim() || !image?.trim() || price === undefined) {
    return res.status(400).json({
      ok: false,
      error: 'Product name, description, price, and image are required.',
    });
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    return res.status(400).json({
      ok: false,
      error: 'Price must be a valid positive number.',
    });
  }

  const parsedStock = Number.parseInt(String(stock ?? '0'), 10);

  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    return res.status(400).json({
      ok: false,
      error: 'Stock must be a valid integer greater than or equal to 0.',
    });
  }

  try {
    const [result] = await pool.execute(
      `
        INSERT INTO collections (product_name, description, price, image, category, source_platform, source_url, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        productName.trim(),
        description.trim(),
        numericPrice,
        image.trim(),
        category?.trim() || 'Custom Collection',
        marketplace?.trim() || '',
        productUrl?.trim() || '',
        parsedStock,
      ]
    );

    const [rows] = await pool.query(
      `
        SELECT id, product_name, description, price, image, category, source_platform, source_url, stock, created_at, updated_at
        FROM collections
        WHERE id = ?
      `,
      [result.insertId]
    );

    return res.status(201).json({
      ok: true,
      collection: normalizeCollection(rows[0]),
    });
  } catch (error) {
    console.error('Failed to create collection:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to create collection.',
    });
  }
});

router.put('/collections/:id', verifyToken, requireAdmin, async (req, res) => {
  const collectionId = Number(req.params.id);
  const { productName, description, price, image, category, marketplace, productUrl, stock } = req.body ?? {};

  if (!Number.isInteger(collectionId) || collectionId <= 0) {
    return res.status(400).json({
      ok: false,
      error: 'Collection id is invalid.',
    });
  }

  if (!productName?.trim() || !description?.trim() || !image?.trim() || price === undefined) {
    return res.status(400).json({
      ok: false,
      error: 'Product name, description, price, and image are required.',
    });
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    return res.status(400).json({
      ok: false,
      error: 'Price must be a valid positive number.',
    });
  }

  const parsedStock = Number.parseInt(String(stock ?? '0'), 10);

  if (!Number.isInteger(parsedStock) || parsedStock < 0) {
    return res.status(400).json({
      ok: false,
      error: 'Stock must be a valid integer greater than or equal to 0.',
    });
  }

  try {
    const [result] = await pool.execute(
      `
        UPDATE collections
        SET product_name = ?, description = ?, price = ?, image = ?, category = ?, source_platform = ?, source_url = ?, stock = ?
        WHERE id = ?
      `,
      [
        productName.trim(),
        description.trim(),
        numericPrice,
        image.trim(),
        category?.trim() || 'Custom Collection',
        marketplace?.trim() || '',
        productUrl?.trim() || '',
        parsedStock,
        collectionId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Collection not found.',
      });
    }

    const [rows] = await pool.query(
      `
        SELECT id, product_name, description, price, image, category, source_platform, source_url, stock, created_at, updated_at
        FROM collections
        WHERE id = ?
      `,
      [collectionId]
    );

    return res.json({
      ok: true,
      collection: normalizeCollection(rows[0]),
    });
  } catch (error) {
    console.error('Failed to update collection:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to update collection.',
    });
  }
});

router.delete('/collections/:id', verifyToken, requireAdmin, async (req, res) => {
  const collectionId = Number(req.params.id);

  if (!Number.isInteger(collectionId) || collectionId <= 0) {
    return res.status(400).json({
      ok: false,
      error: 'Collection id is invalid.',
    });
  }

  try {
    const [result] = await pool.execute('DELETE FROM collections WHERE id = ?', [collectionId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Collection not found.',
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete collection:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to delete collection.',
    });
  }
});

export default router;
