import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from '../models/productModel.js';

const normalizeProduct = (product) => {
  const stock = Math.max(0, Number(product.stock) || 0);

  return {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    description: product.description,
    imageUrl: product.image_url,
    stock,
    category: product.category || 'General',
    stockStatus: stock > 0 ? 'In Stock' : 'Out of Stock',
    lowStockMessage: stock > 0 && stock <= 5 ? `Only ${stock} items left` : '',
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
};

const validateProductInput = (payload) => {
  const name = String(payload?.name || '').trim();
  const description = String(payload?.description || '').trim();
  const imageUrl = String(payload?.imageUrl || payload?.image_url || '').trim();
  const category = String(payload?.category || '').trim() || 'General';
  const price = Number(payload?.price);
  const stock = Number.parseInt(String(payload?.stock ?? ''), 10);

  if (!name || !description || !imageUrl) {
    return { error: 'Name, description, and image URL are required.' };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { error: 'Price must be a valid non-negative number.' };
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return { error: 'Stock must be a valid integer greater than or equal to 0.' };
  }

  return {
    value: {
      name,
      description,
      imageUrl,
      price,
      stock,
      category,
    },
  };
};

export const listProducts = async (_req, res) => {
  try {
    const products = await getAllProducts();
    return res.json({ ok: true, products: products.map(normalizeProduct) });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch products.' });
  }
};

export const getProduct = async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ ok: false, error: 'Product id is invalid.' });
  }

  try {
    const product = await getProductById(productId);

    if (!product) {
      return res.status(404).json({ ok: false, error: 'Product not found.' });
    }

    return res.json({ ok: true, product: normalizeProduct(product) });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch product.' });
  }
};

export const addProduct = async (req, res) => {
  const validation = validateProductInput(req.body);

  if (validation.error) {
    return res.status(400).json({ ok: false, error: validation.error });
  }

  try {
    const product = await createProduct(validation.value);
    return res.status(201).json({ ok: true, product: normalizeProduct(product) });
  } catch (error) {
    console.error('Failed to create product:', error);
    return res.status(500).json({ ok: false, error: 'Failed to create product.' });
  }
};

export const editProduct = async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ ok: false, error: 'Product id is invalid.' });
  }

  const validation = validateProductInput(req.body);

  if (validation.error) {
    return res.status(400).json({ ok: false, error: validation.error });
  }

  try {
    const product = await updateProduct(productId, validation.value);

    if (!product) {
      return res.status(404).json({ ok: false, error: 'Product not found.' });
    }

    return res.json({ ok: true, product: normalizeProduct(product) });
  } catch (error) {
    console.error('Failed to update product:', error);
    return res.status(500).json({ ok: false, error: 'Failed to update product.' });
  }
};

export const removeProduct = async (req, res) => {
  const productId = Number(req.params.id);

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json({ ok: false, error: 'Product id is invalid.' });
  }

  try {
    const deleted = await deleteProduct(productId);

    if (!deleted) {
      return res.status(404).json({ ok: false, error: 'Product not found.' });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return res.status(500).json({ ok: false, error: 'Failed to delete product.' });
  }
};
