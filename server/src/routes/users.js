// Маршруты пользователя (Users)
import { Router } from 'express';
import { telegramAuthMiddleware } from '../middleware/telegramAuth.js';
import { getUserById, updateUser } from '../services/database.js';

const router = Router();

/**
 * GET /api/users/me
 * Получить профиль текущего пользователя.
 * Header: X-Telegram-Init-Data
 */
router.get('/me', telegramAuthMiddleware, async (req, res, next) => {
  try {
    const user = await getUserById(req.telegramUser.id);

    if (!user) {
      return res.status(404).json({ error: true, message: 'Пользователь не найден' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/users/me
 * Обновить профиль текущего пользователя.
 * Body: { direction?, skillLevel?, role? }
 * Header: X-Telegram-Init-Data
 */
router.put('/me', telegramAuthMiddleware, async (req, res, next) => {
  try {
    const allowedFields = ['direction', 'skillLevel', 'role'];
    const updateData = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: true, message: 'Нет данных для обновления' });
    }

    const user = await updateUser(req.telegramUser.id, updateData);
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

export default router;
