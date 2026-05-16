// BarinBil Backend — Главный сервер
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getPool } from './config/database.js';

import authRoutes from './routes/auth.js';
import eventsRoutes from './routes/events.js';
import usersRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: '*', // Для разработки. На проде указать домен фронта
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
}));
app.use(express.json());

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ai', aiRoutes);

// Healthcheck
app.get('/api/health', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      app: 'BarinBil API',
      version: '1.0.0',
      db: 'connected',
      serverTime: result.rows[0].now,
    });
  } catch (err) {
    res.json({
      status: 'degraded',
      app: 'BarinBil API',
      version: '1.0.0',
      db: 'disconnected',
      error: err.message,
    });
  }
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Внутренняя ошибка сервера',
  });
});

app.listen(PORT, () => {
  // Инициализируем пул PostgreSQL при старте
  getPool();
  console.log(`🚀 BarinBil API запущен на порту ${PORT}`);
  console.log(`📦 PostgreSQL: ${process.env.DATABASE_URL ? 'настроен' : 'не настроен'}`);
});

export default app;
