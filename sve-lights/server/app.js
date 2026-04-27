import cors from 'cors';
import express from 'express';
import authRoutes from './routes/authRoutes.js';
import legacyRoutes from './routes/legacyRoutes.js';
import productRoutes from './routes/productRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', legacyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

export default app;
