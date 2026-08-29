import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authTelegram, completeOnboarding, getMyProfile } from '../services/api.js';
import { useTelegram } from '../hooks/useTelegram.js';
import { sound } from '../services/soundEffects.js';
import { fireConfetti } from '../services/confetti.js';

const UserContext = createContext(null);

export const LEVELS = {
  'Новичок': { min: 0, max: 99, next: 'Любитель', icon: '🌱', color: '#10b981' },
  'Любитель': { min: 100, max: 299, next: 'Профи', icon: '⚡', color: '#3b82f6' },
  'Профи': { min: 300, max: 699, next: 'Мастер', icon: '🔥', color: '#f97316' },
  'Мастер': { min: 700, max: Infinity, next: null, icon: '👑', color: '#8b5cf6' },
};

export function calculateLevelFromXP(xp) {
  if (xp >= 700) return 'Мастер';
  if (xp >= 300) return 'Профи';
  if (xp >= 100) return 'Любитель';
  return 'Новичок';
}

export function UserProvider({ children }) {
  const { initData, user: telegramUser } = useTelegram();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'teams' | 'quests' | 'ai' | 'profile'

  // Initialize sound mute setting
  useEffect(() => {
    sound.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Load or authenticate user
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const result = await authTelegram();
        if (result?.user) {
          const userLevel = calculateLevelFromXP(result.user.xp || 0);
          setUser({
            ...result.user,
            level: userLevel,
            bookmarks: result.user.bookmarks || [],
            registeredEvents: result.user.registeredEvents || ['kz_event_1'],
            streak: result.user.streak || 3,
          });
        }
      } catch (err) {
        console.error('[AUTH] Ошибка авторизации:', err);
        setError(err.message);
        // Fallback default
        setUser({
          id: 'dev_user_ermek',
          firstName: 'Ермек',
          lastName: 'Сериков',
          username: 'ermek_dev',
          xp: 150,
          level: 'Любитель',
          direction: 'Full-stack',
          skillLevel: 'Любитель',
          onboardingCompleted: true,
          role: 'student',
          registeredEvents: ['kz_event_1'],
          bookmarks: ['kz_event_2'],
          streak: 4,
        });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [initData, telegramUser]);

  // Save to LocalStorage whenever user state changes
  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('barinbil_user', JSON.stringify(user));
      } catch {}
    }
  }, [user]);

  // Complete Onboarding
  const finishOnboarding = useCallback(async (direction, skillLevel, role = 'student') => {
    try {
      const result = await completeOnboarding(direction, skillLevel, role);
      const userLevel = calculateLevelFromXP(result?.user?.xp || 50);
      setUser(prev => ({
        ...prev,
        ...result.user,
        level: userLevel,
        direction,
        skillLevel,
        role,
        onboardingCompleted: true,
      }));
      sound.playAchievement();
      fireConfetti();
      return result;
    } catch {
      setUser(prev => ({
        ...prev,
        direction,
        skillLevel,
        role,
        onboardingCompleted: true,
        xp: (prev?.xp || 0) + 50,
        level: calculateLevelFromXP((prev?.xp || 0) + 50),
      }));
      sound.playAchievement();
      fireConfetti();
    }
  }, []);

  // Add XP with level up detection, sounds and confetti
  const addXP = useCallback((amount) => {
    setUser(prev => {
      if (!prev) return prev;
      const prevLevel = calculateLevelFromXP(prev.xp || 0);
      const newXP = (prev.xp || 0) + amount;
      const newLevel = calculateLevelFromXP(newXP);

      if (newLevel !== prevLevel) {
        sound.playLevelUp();
        fireConfetti({ count: 90 });
      } else {
        sound.playXP();
      }

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });
  }, []);

  // Toggle bookmark for an event
  const toggleBookmark = useCallback((eventId) => {
    setUser(prev => {
      if (!prev) return prev;
      const bookmarks = prev.bookmarks || [];
      const exists = bookmarks.includes(eventId);
      const updated = exists ? bookmarks.filter(id => id !== eventId) : [...bookmarks, eventId];
      sound.playClick();
      return { ...prev, bookmarks: updated };
    });
  }, []);

  // Add registered event
  const addRegisteredEvent = useCallback((eventId) => {
    setUser(prev => {
      if (!prev) return prev;
      const registeredEvents = [...(prev.registeredEvents || []), eventId];
      return { ...prev, registeredEvents };
    });
  }, []);

  // Role toggle (Student <-> Organizer) for dev / testing
  const toggleRole = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const nextRole = prev.role === 'organizer' ? 'student' : 'organizer';
      sound.playSwitch();
      return { ...prev, role: nextRole };
    });
  }, []);

  // Reset onboarding for testing
  const resetOnboarding = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      return { ...prev, onboardingCompleted: false };
    });
    sound.playClick();
  }, []);

  // Log out
  const logout = useCallback(() => {
    localStorage.removeItem('barinbil_user');
    setUser(null);
    window.location.reload();
  }, []);

  // Progress computation
  const xpProgress = (() => {
    if (!user) return { current: 0, max: 100, percent: 0, nextLevel: 'Любитель', remaining: 100 };
    const levelInfo = LEVELS[user.level] || LEVELS['Новичок'];
    const currentInLevel = user.xp - levelInfo.min;
    const span = levelInfo.max === Infinity ? 300 : levelInfo.max - levelInfo.min + 1;
    const percent = Math.min(100, Math.max(0, Math.round((currentInLevel / span) * 100)));
    const remaining = levelInfo.max === Infinity ? 0 : levelInfo.max - user.xp + 1;

    return {
      current: user.xp,
      levelMin: levelInfo.min,
      levelMax: levelInfo.max,
      percent,
      nextLevel: levelInfo.next,
      remaining,
      icon: levelInfo.icon,
      color: levelInfo.color,
    };
  })();

  const value = {
    user,
    setUser,
    loading,
    error,
    activeTab,
    setActiveTab,
    finishOnboarding,
    addXP,
    addRegisteredEvent,
    toggleBookmark,
    toggleRole,
    resetOnboarding,
    soundEnabled,
    setSoundEnabled,
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

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}
