// Telegram initData валидация через HMAC-SHA256
// Документация: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
import crypto from 'crypto';

/**
 * Валидирует initData от Telegram Web App.
 * Проверяет подпись HMAC-SHA256 с использованием Bot Token.
 * 
 * @param {string} initData — строка initData от Telegram
 * @returns {{ valid: boolean, user: object|null }} — результат валидации
 */
export function validateTelegramInitData(initData) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.warn('[TG_AUTH] TELEGRAM_BOT_TOKEN не задан в .env');
      return { valid: false, user: null };
    }

    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return { valid: false, user: null };

    // Удаляем hash из параметров для проверки
    params.delete('hash');

    // Сортируем параметры и создаём строку для проверки
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Создаём secret key: HMAC-SHA256 от "WebAppData" + bot_token
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Вычисляем подпись
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return { valid: false, user: null };
    }

    // Парсим данные пользователя
    const userStr = params.get('user');
    const user = userStr ? JSON.parse(userStr) : null;

    return { valid: true, user };
  } catch (error) {
    console.error('[TG_AUTH] Ошибка валидации:', error.message);
    return { valid: false, user: null };
  }
}

/**
 * Express Middleware: проверяет Telegram initData из заголовка X-Telegram-Init-Data.
 * При успешной валидации добавляет req.telegramUser.
 */
export function telegramAuthMiddleware(req, res, next) {
  const initData = req.headers['x-telegram-init-data'];

  if (!initData) {
    return res.status(401).json({ error: true, message: 'Нет данных авторизации Telegram' });
  }

  const { valid, user } = validateTelegramInitData(initData);

  if (!valid || !user) {
    return res.status(401).json({ error: true, message: 'Невалидные данные авторизации Telegram' });
  }

  // Сохраняем данные пользователя в request
  req.telegramUser = user;
  next();
}
