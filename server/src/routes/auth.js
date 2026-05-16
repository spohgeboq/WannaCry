// Маршрут авторизации через Telegram
import { Router } from 'express';
import { validateTelegramInitData } from '../middleware/telegramAuth.js';
import { upsertUser, getUserById, addXP } from '../services/database.js';

const router = Router();

/**
 * POST /api/auth/telegram
 * Авторизация/регистрация через Telegram initData.
 * Body: { initData: string }
 * Ответ: { user: {...}, isNew: boolean }
 */
router.post('/telegram', async (req, res, next) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: true, message: 'initData обязателен' });
    }

    const { valid, user: telegramUser } = validateTelegramInitData(initData);

    if (!valid || !telegramUser) {
      return res.status(401).json({ error: true, message: 'Невалидные данные Telegram' });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await getUserById(telegramUser.id);
    const isNew = !existingUser;

    // Создаём или обновляем пользователя
    const user = await upsertUser(telegramUser);

    // Если новый пользователь — начисляем XP за регистрацию
    if (isNew) {
      await addXP(telegramUser.id, 10); // +10 XP за регистрацию
      user.xp = 10;
    }

    res.json({
      success: true,
      user,
      isNew,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/onboarding
 * Сохранение данных онбординга (направление и уровень).
 * Body: { initData, direction, skillLevel }
 */
router.post('/onboarding', async (req, res, next) => {
  try {
    const { initData, direction, skillLevel, role } = req.body;

    if (!initData || !direction || !skillLevel) {
      return res.status(400).json({ error: true, message: 'Все поля обязательны' });
    }

    // Валидация роли — только student или organizer
    const validRole = ['student', 'organizer'].includes(role) ? role : 'student';

    const { valid, user: telegramUser } = validateTelegramInitData(initData);

    if (!valid || !telegramUser) {
      return res.status(401).json({ error: true, message: 'Невалидные данные Telegram' });
    }

    const user = await upsertUser(telegramUser, {
      direction,
      skillLevel,
      onboardingCompleted: true,
      role: validRole,
    });

    // Начисляем XP за прохождение онбординга (+20 XP)
    const xpResult = await addXP(telegramUser.id, 20);

    res.json({
      success: true,
      user: { ...user, ...xpResult },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
