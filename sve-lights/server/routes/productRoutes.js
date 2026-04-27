import express from 'express';
import {
  addProduct,
  editProduct,
  getProduct,
  listProducts,
  removeProduct,
} from '../controllers/productController.js';
import { requireAdmin, verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', verifyToken, requireAdmin, addProduct);
router.put('/:id', verifyToken, requireAdmin, editProduct);
router.delete('/:id', verifyToken, requireAdmin, removeProduct);

export default router;
