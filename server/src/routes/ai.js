// Маршруты AI-наставника
import { Router } from 'express';
import { telegramAuthMiddleware } from '../middleware/telegramAuth.js';
import { getUserById } from '../services/database.js';
import { generateMentorInsight, generateReflection } from '../services/openai.js';

const router = Router();

/**
 * POST /api/ai/mentor
 * Генерирует персонализированное описание мероприятия через AI.
 * Body: { eventDescription }
 * Header: X-Telegram-Init-Data
 */
router.post('/mentor', telegramAuthMiddleware, async (req, res, next) => {
  try {
    const { eventDescription } = req.body;

    if (!eventDescription) {
      return res.status(400).json({ error: true, message: 'eventDescription обязателен' });
    }

    // Получаем данные пользователя для персонализации
    const user = await getUserById(req.telegramUser.id);
    const userLevel = user?.level || 'Новичок';
    const userDirection = user?.direction || 'IT';

    const insight = await generateMentorInsight(eventDescription, userLevel, userDirection);

    res.json({ success: true, insight });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/reflection
 * Генерирует рефлексию после мероприятия через AI.
 * Body: { eventTitle, xpEarned }
 * Header: X-Telegram-Init-Data
 */
router.post('/reflection', telegramAuthMiddleware, async (req, res, next) => {
  try {
    const { eventTitle, xpEarned = 50 } = req.body;

    if (!eventTitle) {
      return res.status(400).json({ error: true, message: 'eventTitle обязателен' });
    }

    const user = await getUserById(req.telegramUser.id);
    const userLevel = user?.level || 'Новичок';

    const reflection = await generateReflection(eventTitle, userLevel, xpEarned);

    res.json({ success: true, reflection });
  } catch (error) {
    next(error);
  }
});

export default router;
