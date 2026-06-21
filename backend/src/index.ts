import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';

import authRouter from './routes/auth.routes.js';
import bannerRouter from './routes/banner.routes.js';
import categoryRouter from './routes/category.routes.js';
import productRouter from './routes/product.routes.js';
import orderRouter from './routes/order.routes.js';
import reportRouter from './routes/report.routes.js';
import reviewRouter from './routes/review.routes.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey']
}));
app.use(helmet({
  crossOriginResourcePolicy: false // Allow images to load on other domains
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/banners', bannerRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/reports', reportRouter);
app.use('/api/reviews', reviewRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Start Server
const port = parseInt(env.PORT);
app.listen(port, '0.0.0.0', () => {
  console.log(`Banmayfilm API backend running on http://0.0.0.0:${port}`);
});
