// Сервис работы с PostgreSQL — Users и Events
import { query } from '../config/database.js';

// =================== USERS ===================

/**
 * Создаёт или обновляет пользователя по Telegram ID.
 */
export async function upsertUser(telegramUser, extraData = {}) {
  const telegramId = telegramUser.id;
  const firstName = telegramUser.first_name || '';
  const lastName = telegramUser.last_name || '';
  const username = telegramUser.username || '';
  const photoUrl = telegramUser.photo_url || '';

  // Пробуем найти пользователя
  const existing = await query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);

  if (existing.rows.length > 0) {
    // Обновляем данные при каждом логине
    const sets = [
      'first_name = $2',
      'last_name = $3',
      'username = $4',
      'photo_url = $5',
      'last_login = NOW()',
    ];
    const params = [telegramId, firstName, lastName, username, photoUrl];
    let paramIdx = 6;

    if (extraData.direction) {
      sets.push(`direction = $${paramIdx}`);
      params.push(extraData.direction);
      paramIdx++;
    }
    if (extraData.skillLevel) {
      sets.push(`skill_level = $${paramIdx}`);
      params.push(extraData.skillLevel);
      paramIdx++;
    }
    if (extraData.onboardingCompleted !== undefined) {
      sets.push(`onboarding_completed = $${paramIdx}`);
      params.push(extraData.onboardingCompleted);
      paramIdx++;
    }
    if (extraData.role) {
      sets.push(`role = $${paramIdx}`);
      params.push(extraData.role);
      paramIdx++;
    }

    const result = await query(
      `UPDATE users SET ${sets.join(', ')} WHERE telegram_id = $1 RETURNING *`,
      params
    );
    return formatUser(result.rows[0]);
  }

  // Новый пользователь
  const result = await query(
    `INSERT INTO users (telegram_id, first_name, last_name, username, photo_url, direction, skill_level, role)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      telegramId,
      firstName,
      lastName,
      username,
      photoUrl,
      extraData.direction || null,
      extraData.skillLevel || null,
      extraData.role || 'student',
    ]
  );
  return formatUser(result.rows[0]);
}

/**
 * Получает пользователя по Telegram ID.
 */
export async function getUserById(telegramId) {
  const result = await query('SELECT * FROM users WHERE telegram_id = $1', [telegramId]);
  if (result.rows.length === 0) return null;
  return formatUser(result.rows[0]);
}

/**
 * Обновляет данные профиля пользователя.
 */
export async function updateUser(telegramId, data) {
  const sets = [];
  const params = [telegramId];
  let idx = 2;

  const allowedFields = {
    direction: 'direction',
    skillLevel: 'skill_level',
    role: 'role',
    onboardingCompleted: 'onboarding_completed',
  };

  for (const [jsKey, dbKey] of Object.entries(allowedFields)) {
    if (data[jsKey] !== undefined) {
      sets.push(`${dbKey} = $${idx}`);
      params.push(data[jsKey]);
      idx++;
    }
  }

  if (sets.length === 0) return getUserById(telegramId);

  const result = await query(
    `UPDATE users SET ${sets.join(', ')} WHERE telegram_id = $1 RETURNING *`,
    params
  );
  return formatUser(result.rows[0]);
}

/**
 * Начисляет XP пользователю и пересчитывает уровень.
 * Уровни: beginner (0-99), amateur (100-299), pro (300+)
 */
export async function addXP(telegramId, amount) {
  const result = await query(
    `UPDATE users SET xp = xp + $2 WHERE telegram_id = $1 RETURNING *`,
    [telegramId, amount]
  );

  if (result.rows.length === 0) return null;

  const user = result.rows[0];
  const newLevel = calculateLevel(user.xp);

  if (newLevel !== user.level) {
    await query('UPDATE users SET level = $2 WHERE telegram_id = $1', [telegramId, newLevel]);
  }

  return { xp: user.xp, level: newLevel, added: amount };
}

/**
 * Вычисляет уровень на основе XP.
 */
function calculateLevel(xp) {
  if (xp >= 300) return 'pro';
  if (xp >= 100) return 'amateur';
  return 'beginner';
}

/**
 * Маппинг уровней в русские названия (для фронта).
 */
const LEVEL_NAMES = {
  beginner: 'Новичок',
  amateur: 'Любитель',
  pro: 'Профи',
};

/**
 * Форматирует пользователя из snake_case в camelCase.
 */
function formatUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    telegramId: row.telegram_id,
    firstName: row.first_name,
    lastName: row.last_name,
    username: row.username,
    photoUrl: row.photo_url,
    xp: row.xp,
    level: LEVEL_NAMES[row.level] || row.level,
    direction: row.direction,
    skillLevel: row.skill_level,
    onboardingCompleted: row.onboarding_completed,
    role: row.role,
    createdAt: row.created_at,
    lastLogin: row.last_login,
  };
}

// =================== EVENTS ===================

/**
 * Создаёт новое мероприятие.
 */
export async function createEvent(eventData, organizerId) {
  const result = await query(
    `INSERT INTO events (title, description, tags, beginner_friendly, organizer_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      eventData.title,
      eventData.description,
      eventData.tags || [],
      eventData.beginnerFriendly || false,
      organizerId,
    ]
  );
  return formatEvent(result.rows[0]);
}

/**
 * Получает список мероприятий (лента).
 */
export async function getEvents(limit = 20) {
  const result = await query(
    'SELECT * FROM events ORDER BY created_at DESC LIMIT $1',
    [limit]
  );
  return result.rows.map(formatEvent);
}

/**
 * Получает мероприятие по ID.
 */
export async function getEventById(eventId) {
  const result = await query('SELECT * FROM events WHERE id = $1', [eventId]);
  if (result.rows.length === 0) return null;
  return formatEvent(result.rows[0]);
}

/**
 * Регистрирует пользователя на мероприятие (+50 XP).
 */
export async function registerForEvent(eventId, telegramId) {
  // Проверяем, не зарегистрирован ли уже
  const existing = await query(
    'SELECT * FROM registrations WHERE user_telegram_id = $1 AND event_id = $2',
    [telegramId, eventId]
  );

  if (existing.rows.length > 0) {
    throw new Error('Вы уже зарегистрированы на это мероприятие');
  }

  // Проверяем, существует ли мероприятие
  const event = await query('SELECT * FROM events WHERE id = $1', [eventId]);
  if (event.rows.length === 0) {
    throw new Error('Мероприятие не найдено');
  }

  // Регистрируем
  await query(
    'INSERT INTO registrations (user_telegram_id, event_id) VALUES ($1, $2)',
    [telegramId, eventId]
  );

  // Обновляем счётчик регистраций
  await query(
    'UPDATE events SET registration_count = registration_count + 1 WHERE id = $1',
    [eventId]
  );

  // Начисляем XP
  const xpResult = await addXP(telegramId, 50);

  return { registered: true, eventId, ...xpResult };
}

/**
 * Получает список зарегистрированных ивентов пользователя.
 */
export async function getUserRegistrations(telegramId) {
  const result = await query(
    'SELECT event_id FROM registrations WHERE user_telegram_id = $1',
    [telegramId]
  );
  return result.rows.map(r => r.event_id);
}

/**
 * Форматирует мероприятие из snake_case в camelCase.
 */
function formatEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    tags: row.tags || [],
    beginnerFriendly: row.beginner_friendly,
    organizerId: row.organizer_id,
    registrationCount: row.registration_count,
    createdAt: row.created_at,
  };
}
