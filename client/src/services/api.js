// API сервис — все запросы к backend
import axios from 'axios';

// Базовый URL бэкенда (в проде заменить на реальный)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Создаём axios-инстанс с базовым URL.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Получает initData из Telegram WebApp.
 */
function getInitData() {
  return window.Telegram?.WebApp?.initData || '';
}

// =================== AUTH ===================

/**
 * Авторизация через Telegram.
 * @returns {{ user, isNew }}
 */
export async function authTelegram() {
  const initData = getInitData();
  const { data } = await api.post('/auth/telegram', { initData });
  return data;
}

/**
 * Сохранение онбординга.
 * @param {string} direction — направление (Full-stack, Дизайн и т.д.)
 * @param {string} skillLevel — уровень (Новичок, Любитель, Профи)
 */
export async function completeOnboarding(direction, skillLevel, role = 'student') {
  const initData = getInitData();
  const { data } = await api.post('/auth/onboarding', { initData, direction, skillLevel, role });
  return data;
}

// =================== EVENTS ===================

/**
 * Получить ленту мероприятий.
 */
export async function getEvents(limit = 20) {
  const { data } = await api.get('/events', { params: { limit } });
  return data;
}

/**
 * Получить мероприятие по ID.
 */
export async function getEventById(eventId) {
  const { data } = await api.get(`/events/${eventId}`);
  return data;
}

/**
 * Создать мероприятие.
 */
export async function createEvent(eventData) {
  const initData = getInitData();
  const { data } = await api.post('/events', eventData, {
    headers: { 'X-Telegram-Init-Data': initData },
  });
  return data;
}

/**
 * Зарегистрироваться на мероприятие (+50 XP).
 */
export async function registerForEvent(eventId) {
  const initData = getInitData();
  const { data } = await api.post(`/events/${eventId}/register`, {}, {
    headers: { 'X-Telegram-Init-Data': initData },
  });
  return data;
}

// =================== USERS ===================

/**
 * Получить профиль текущего пользователя.
 */
export async function getMyProfile() {
  const initData = getInitData();
  const { data } = await api.get('/users/me', {
    headers: { 'X-Telegram-Init-Data': initData },
  });
  return data;
}

/**
 * Обновить профиль текущего пользователя.
 */
export async function updateMyProfile(updateData) {
  const initData = getInitData();
  const { data } = await api.put('/users/me', updateData, {
    headers: { 'X-Telegram-Init-Data': initData },
  });
  return data;
}

// =================== AI ===================

/**
 * Получить AI-инсайт для мероприятия.
 */
export async function getAIMentorInsight(eventDescription) {
  const initData = getInitData();
  const { data } = await api.post('/ai/mentor', { eventDescription }, {
    headers: { 'X-Telegram-Init-Data': initData },
  });
  return data;
}

/**
 * Получить AI-рефлексию после мероприятия.
 */
export async function getAIReflection(eventTitle, xpEarned = 50) {
  const initData = getInitData();
  const { data } = await api.post('/ai/reflection', { eventTitle, xpEarned }, {
    headers: { 'X-Telegram-Init-Data': initData },
  });
  return data;
}

export default api;
