// Middleware проверки роли пользователя
import { getUserById } from '../services/database.js';

/**
 * Создаёт middleware для проверки роли.
 * Работает ПОСЛЕ telegramAuthMiddleware (нужен req.telegramUser).
 * 
 * @param  {...string} allowedRoles — допустимые роли ('organizer', 'student')
 * @returns {Function} Express middleware
 */
export function requireRole(...allowedRoles) {
  return async (req, res, next) => {
    try {
      if (!req.telegramUser) {
        return res.status(401).json({
          error: true,
          message: 'Необходима авторизация',
        });
      }

      const user = await getUserById(req.telegramUser.id);

      if (!user) {
        return res.status(404).json({
          error: true,
          message: 'Пользователь не найден',
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          error: true,
          message: 'Недостаточно прав. Эта функция доступна только для: ' + allowedRoles.join(', '),
        });
      }

      // Сохраняем полные данные пользователя
      req.dbUser = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}
