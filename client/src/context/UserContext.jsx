// Глобальный контекст пользователя
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authTelegram, completeOnboarding, getMyProfile } from '../services/api.js';
import { useTelegram } from '../hooks/useTelegram.js';

const UserContext = createContext(null);

/**
 * Константы уровней и XP для прогресса
 */
const LEVELS = {
  'Новичок': { min: 0, max: 99, next: 'Любитель' },
  'Любитель': { min: 100, max: 299, next: 'Профи' },
  'Профи': { min: 300, max: Infinity, next: null },
};

/**
 * UserProvider — управляет состоянием пользователя во всём приложении.
 */
export function UserProvider({ children }) {
  const { initData, user: telegramUser } = useTelegram();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Автоматическая авторизация при загрузке
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);

        if (!initData) {
          // Режим разработки без Telegram — создаём мок-пользователя
          setUser({
            id: 'dev_user',
            firstName: 'Разработчик',
            lastName: '',
            username: 'dev',
            xp: 0,
            level: 'Новичок',
            direction: null,
            skillLevel: null,
            onboardingCompleted: false,
            role: 'student',
            registeredEvents: [],
          });
          setLoading(false);
          return;
        }

        const result = await authTelegram();
        setUser(result.user);
      } catch (err) {
        console.error('[AUTH] Ошибка авторизации:', err);
        setError(err.message);
        // Fallback: используем данные из Telegram напрямую
        if (telegramUser) {
          setUser({
            id: String(telegramUser.id),
            firstName: telegramUser.first_name,
            lastName: telegramUser.last_name || '',
            username: telegramUser.username || '',
            xp: 0,
            level: 'Новичок',
            direction: null,
            skillLevel: null,
            onboardingCompleted: false,
            role: 'student',
            registeredEvents: [],
          });
        }
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [initData, telegramUser]);

  // Завершить онбординг
  const finishOnboarding = useCallback(async (direction, skillLevel, role = 'student') => {
    try {
      const result = await completeOnboarding(direction, skillLevel, role);
      setUser(prev => ({
        ...prev,
        ...result.user,
        direction,
        skillLevel,
        role,
        onboardingCompleted: true,
      }));
      return result;
    } catch (err) {
      // Fallback — обновляем локально
      setUser(prev => ({
        ...prev,
        direction,
        skillLevel,
        role,
        onboardingCompleted: true,
        xp: (prev?.xp || 0) + 20,
      }));
    }
  }, []);

  // Обновить XP локально (после действия)
  const addXP = useCallback((amount) => {
    setUser(prev => {
      if (!prev) return prev;
      const newXP = (prev.xp || 0) + amount;
      let newLevel = 'Новичок';
      if (newXP >= 300) newLevel = 'Профи';
      else if (newXP >= 100) newLevel = 'Любитель';
      return { ...prev, xp: newXP, level: newLevel };
    });
  }, []);

  // Добавить зарегистрированный ивент
  const addRegisteredEvent = useCallback((eventId) => {
    setUser(prev => {
      if (!prev) return prev;
      const registeredEvents = [...(prev.registeredEvents || []), eventId];
      return { ...prev, registeredEvents };
    });
  }, []);

  // Обновить профиль
  const refreshProfile = useCallback(async () => {
    try {
      const result = await getMyProfile();
      setUser(result.user);
    } catch (err) {
      console.error('[USER] Ошибка обновления профиля:', err);
    }
  }, []);

  const logout = useCallback(() => {
    // Сбрасываем текущего пользователя (онбординг начнется заново, или просто очистим сессию)
    setUser(null);
  }, []);

  // Вычисление прогресса XP
  const xpProgress = (() => {
    if (!user) return { current: 0, max: 100, percent: 0, nextLevel: 'Любитель' };
    const levelInfo = LEVELS[user.level] || LEVELS['Новичок'];
    const current = user.xp - levelInfo.min;
    const max = levelInfo.max === Infinity ? 100 : levelInfo.max - levelInfo.min + 1;
    const percent = Math.min(100, Math.round((current / max) * 100));
    return { current: user.xp, max: levelInfo.max, percent, nextLevel: levelInfo.next };
  })();

  const value = {
    user,
    loading,
    error,
    finishOnboarding,
    addXP,
    addRegisteredEvent,
    refreshProfile,
    xpProgress,
    logout,
    isOnboarded: user?.onboardingCompleted === true,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

/**
 * Хук для доступа к контексту пользователя.
 */
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser должен использоваться внутри UserProvider');
  }
  return context;
}
