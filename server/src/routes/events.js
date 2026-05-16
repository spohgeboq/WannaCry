// Маршруты мероприятий (Events)
import { Router } from 'express';
import { telegramAuthMiddleware } from '../middleware/telegramAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { createEvent, getEvents, getEventById, registerForEvent } from '../services/database.js';

const router = Router();

/**
 * GET /api/events
 * Получить ленту мероприятий. Не требует авторизации.
 * Query: ?limit=20
 */
router.get('/', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const events = await getEvents(limit);
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/events/:id
 * Получить конкретное мероприятие по ID.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const event = await getEventById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: true, message: 'Мероприятие не найдено' });
    }
    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events
 * Создать мероприятие (только для авторизованных организаторов).
 * Body: { title, description, tags, beginnerFriendly }
 * Header: X-Telegram-Init-Data
 */
router.post('/', telegramAuthMiddleware, requireRole('organizer'), async (req, res, next) => {
  try {
    const { title, description, tags, beginnerFriendly } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: true, message: 'Название и описание обязательны' });
    }

    const event = await createEvent(
      { title, description, tags, beginnerFriendly },
      req.telegramUser.id
    );

    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/events/:id/register
 * Регистрация на мероприятие (+50 XP).
 * Header: X-Telegram-Init-Data
 */
router.post('/:id/register', telegramAuthMiddleware, async (req, res, next) => {
  try {
    const result = await registerForEvent(req.params.id, req.telegramUser.id);
    res.json({ success: true, ...result });
  } catch (error) {
    if (error.message.includes('уже зарегистрированы') || error.message.includes('не найден')) {
      return res.status(400).json({ error: true, message: error.message });
    }
    next(error);
  }
});

export default router;
