// Enhanced API & Mock Database for BarinBil
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 4000,
});

function getInitData() {
  return window.Telegram?.WebApp?.initData || '';
}

// ================= INITIAL RICH MOCK DATABASE =================
const DEFAULT_EVENTS = [
  {
    id: 'kz_event_1',
    title: 'Astana Hub AI & LLM Hackathon 2026',
    description: 'Масштабный 48-часовой хакатон по созданию интеллектуальных ассистентов, автономных агентов и локализованных LLM для Центральной Азии. Бесплатное проживание в Astana Hub для иногородних финалистов.',
    tags: ['AI', 'Хакатон', 'Python', 'LLM', 'Astana Hub'],
    category: 'hackathon',
    city: 'Astana',
    locationName: 'Astana Hub, пр. Мангилик Ел, С4.6',
    isOnline: false,
    prizePool: '₸ 2,500,000',
    prizeNumber: 2500000,
    startDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 6).toISOString(),
    beginnerFriendly: true,
    organizerId: 'astana_hub',
    organizerName: 'Astana Hub Community',
    registrationCount: 142,
    maxParticipants: 300,
    agenda: [
      { time: 'День 1, 10:00', title: 'Открытие и презентация треков от менторов' },
      { time: 'День 1, 14:00', title: 'Чекпоинт #1: Формирование концепта и архитектуры' },
      { time: 'День 2, 11:00', title: 'Чекпоинт #2: Менторская сессия и ревью кода' },
      { time: 'День 2, 18:00', title: 'Питчинг перед инвесторами и награждение' },
    ],
    speakers: [
      { name: 'Алибек Данияров', role: 'Lead AI Engineer @ Google', avatar: '👨‍💻' },
      { name: 'Мадина Сейтжан', role: 'Head of Tech @ Astana Hub', avatar: '👩‍💼' },
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'kz_event_2',
    title: 'Kolesa Conf 2026: Modern Web & Scalable Backend',
    description: 'Главная инженерная конференция весны в Алматы. Практические кейсы высоких нагрузок, React 19, Go микросервисы, PostgreSQL оптимизации и архитектура платформ с миллионным DAU.',
    tags: ['Frontend', 'Backend', 'React', 'Go', 'Postgres', 'Алматы'],
    category: 'meetup',
    city: 'Almaty',
    locationName: 'Алматы, Отель Rixos Almaty Grand Ballroom',
    isOnline: false,
    prizePool: 'Merch & Swag Box',
    prizeNumber: 0,
    startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 7.5).toISOString(),
    beginnerFriendly: false,
    organizerId: 'kolesa_group',
    organizerName: 'Kolesa Group Team',
    registrationCount: 380,
    maxParticipants: 500,
    agenda: [
      { time: '12:00', title: 'Сбор гостей, кофе и нетворкинг зона' },
      { time: '13:00', title: 'Keynote: Архитектура супер-аппов нового поколения' },
      { time: '15:30', title: 'Frontend Track: React 19 Server Actions & Performance' },
      { time: '17:00', title: 'Afterparty и розыгрыш призов' },
    ],
    speakers: [
      { name: 'Нурсултан Касымов', role: 'Principal Architect @ Kolesa', avatar: '🚀' },
      { name: 'Елена Пак', role: 'Staff Frontend Engineer', avatar: '✨' },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'kz_event_3',
    title: 'Decenter Web3 & TON Bootcamp 2026',
    description: 'Интенсивный 3-дневный онлайн воркшоп по созданию Telegram Mini Apps на TON, смарт-контрактам FunC/Tact и интеграции криптоплатежей. Призы лучшим проектам в TON.',
    tags: ['Web3', 'TON', 'Telegram Apps', 'Solidity', 'Blockchain'],
    category: 'workshop',
    city: 'Online',
    locationName: 'Online Stream / Telegram Live',
    isOnline: true,
    prizePool: '5,000 $TON (~₸ 1,200,000)',
    prizeNumber: 1200000,
    startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    beginnerFriendly: true,
    organizerId: 'decenter_org',
    organizerName: 'Decenter Crypto Hub',
    registrationCount: 215,
    maxParticipants: 400,
    agenda: [
      { time: 'Модуль 1', title: 'Основы TON архитектуры и разработка смарт-контрактов' },
      { time: 'Модуль 2', title: 'Создание Telegram Mini App c подключением TonConnect' },
      { time: 'Модуль 3', title: 'Финальный хакатон и защита проектов' },
    ],
    speakers: [
      { name: 'Арман Жаксылыков', role: 'Core Dev @ TON Foundation', avatar: '💎' },
    ],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'kz_event_4',
    title: 'UX/UI Design Sprint: Redesign Kazakhstan GovTech',
    description: 'Дизайн-баттл для продуктовых дизайнеров: улучшаем пользовательский опыт государственных сервисов и финтех продуктов. Менторы из Kaspi и Choco.',
    tags: ['Дизайн', 'Figma', 'UX/UI', 'Product Design', 'Алматы'],
    category: 'workshop',
    city: 'Almaty',
    locationName: 'Almaty, Most IT Hub, ул. Ходжанова 2/2',
    isOnline: false,
    prizePool: '₸ 800,000 + Офферы',
    prizeNumber: 800000,
    startDate: new Date(Date.now() + 86400000 * 9).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    beginnerFriendly: true,
    organizerId: 'most_hub',
    organizerName: 'MOST IT Hub',
    registrationCount: 94,
    maxParticipants: 150,
    agenda: [
      { time: '11:00', title: 'Бриф от продуктовых лидов и разбивка на пары' },
      { time: '14:00', title: 'UX-аудит и быстрое прототипирование в Figma' },
      { time: '17:30', title: 'Шоукейс работ и разбор от жюри' },
    ],
    speakers: [
      { name: 'Динара Оспанова', role: 'Lead Product Designer @ Kaspi', avatar: '🎨' },
    ],
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'kz_event_5',
    title: 'Cloud & DevOps Meetup: Kubernetes at Scale',
    description: 'Глубокое погружение в CI/CD, GitOps, мониторинг с Prometheus & Grafana и защиту облачных сред. Идеально для бэкендеров и системных инженеров.',
    tags: ['DevOps', 'Kubernetes', 'Docker', 'AWS', 'Security'],
    category: 'meetup',
    city: 'Astana',
    locationName: 'Astana, Nazarbayev University, Блок C2',
    isOnline: false,
    prizePool: 'Swag & Cloud Credits $500',
    prizeNumber: 250000,
    startDate: new Date(Date.now() + 86400000 * 12).toISOString(),
    endDate: new Date(Date.now() + 86400000 * 12.3).toISOString(),
    beginnerFriendly: false,
    organizerId: 'nu_tech',
    organizerName: 'NU Tech Community',
    registrationCount: 88,
    maxParticipants: 120,
    agenda: [
      { time: '18:00', title: 'Миграция монолита в k8s кластер без даунтайма' },
      { time: '19:15', title: 'Zero Trust Security в облаке' },
      { time: '20:30', title: 'Пицца, напитки и Q&A сессия' },
    ],
    speakers: [
      { name: 'Тимур Сабитов', role: 'Cloud Architect @ Yandex Cloud', avatar: '☁️' },
    ],
    createdAt: new Date(Date.now() - 345600000).toISOString(),
  }
];

const DEFAULT_TEAMS = [
  {
    id: 'team_1',
    eventTitle: 'Astana Hub AI & LLM Hackathon',
    teamName: 'Neural Nomad',
    authorName: 'Адильхан',
    authorRole: 'Backend / AI Dev',
    authorTelegram: 'adilkhan_dev',
    currentMembers: 2,
    maxMembers: 4,
    description: 'Делаем AI-помощника для врачей на базе локальной LLM. У нас есть бэкендер и дата-сайентист.',
    neededRoles: ['Frontend (React)', 'UI/UX Дизайнер'],
    createdAt: '2 часа назад'
  },
  {
    id: 'team_2',
    eventTitle: 'Decenter Web3 Bootcamp',
    teamName: 'CryptoKazakhs',
    authorName: 'Султан',
    authorRole: 'Smart Contract Dev',
    authorTelegram: 'sultan_ton',
    currentMembers: 3,
    maxMembers: 4,
    description: 'Разрабатываем Telegram Mini App с p2p-микроплатежами. Ищем крутого фронтендера!',
    neededRoles: ['React/Vite Dev', 'QA Tester'],
    createdAt: 'Вчера'
  },
  {
    id: 'team_3',
    eventTitle: 'UX/UI Design Sprint',
    teamName: 'GovUX Lab',
    authorName: 'Айгерим',
    authorRole: 'Product Researcher',
    authorTelegram: 'aigerim_ux',
    currentMembers: 1,
    maxMembers: 2,
    description: 'Ищу пару для участия в дизайн-спринте. Хочу переработать eGov кабинет.',
    neededRoles: ['UI Дизайнер Figma'],
    createdAt: '3 дня назад'
  }
];

const DEFAULT_LEADERBOARD = [
  { rank: 1, name: 'Ернар Муратов', username: 'ernar_kz', xp: 1450, level: 'Мастер', eventsAttended: 12, streak: 18, avatar: '👑' },
  { rank: 2, name: 'Камила Бекенова', username: 'kamila_ai', xp: 1120, level: 'Профи', eventsAttended: 9, streak: 14, avatar: '🌟' },
  { rank: 3, name: 'Даурен Сарсенов', username: 'dauren_dev', xp: 950, level: 'Профи', eventsAttended: 8, streak: 9, avatar: '⚡' },
  { rank: 4, name: 'Алина Цой', username: 'alina_ux', xp: 740, level: 'Профи', eventsAttended: 6, streak: 7, avatar: '🎨' },
  { rank: 5, name: 'Бауржан Омаров', username: 'baur_fullstack', xp: 620, level: 'Любитель', eventsAttended: 5, streak: 5, avatar: '💻' },
  { rank: 6, name: 'Тимур Рахимов', username: 'timur_ton', xp: 510, level: 'Любитель', eventsAttended: 4, streak: 4, avatar: '💎' },
  { rank: 7, name: 'Жанна Ахметова', username: 'zhanna_ds', xp: 430, level: 'Любитель', eventsAttended: 3, streak: 3, avatar: '📊' },
  { rank: 8, name: 'Арсен Кусаинов', username: 'arsen_k', xp: 380, level: 'Любитель', eventsAttended: 3, streak: 2, avatar: '🚀' },
];

const DEFAULT_QUESTS = [
  { id: 'q1', title: 'Ежедневный вход в BarinBil', xp: 20, completed: false, claimed: false, icon: '🔥' },
  { id: 'q2', title: 'Запросить совет у AI-Наставника', xp: 30, completed: false, claimed: false, icon: '✨' },
  { id: 'q3', title: 'Записаться на 1 мероприятие', xp: 50, completed: false, claimed: false, icon: '🎟️' },
  { id: 'q4', title: 'Найти напарника или команду', xp: 40, completed: false, claimed: false, icon: '🤝' },
];

const DEFAULT_ACHIEVEMENTS = [
  { id: 'ach_1', title: 'Первый шаг', desc: 'Успешно завершить онбординг и войти в IT', icon: '🐣', unlocked: true, xp: 20 },
  { id: 'ach_2', title: 'Билет в будущее', desc: 'Зарегистрироваться на первое событие', icon: '🎟️', unlocked: false, xp: 50 },
  { id: 'ach_3', title: 'AI Энтузиаст', desc: 'Использовать AI-Советника 3 раза', icon: '🤖', unlocked: false, xp: 60 },
  { id: 'ach_4', title: 'Командный дух', desc: 'Найти команду через Team Finder', icon: '🤝', unlocked: false, xp: 75 },
  { id: 'ach_5', title: 'В огне!', desc: 'Удержать 3-дневный стрик посещений', icon: '🔥', unlocked: false, xp: 100 },
  { id: 'ach_6', title: 'Грандмастер BarinBil', desc: 'Набрать 500+ XP и войти в топ лиги', icon: '🏆', unlocked: false, xp: 200 },
];

// LocalStorage Helper
function getStored(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStored(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // Ignore storage quota
  }
}

// =================== AUTH & ONBOARDING ===================
export async function authTelegram() {
  const initData = getInitData();
  try {
    const { data } = await api.post('/auth/telegram', { initData });
    return data;
  } catch {
    // Fallback mock
    const savedUser = getStored('barinbil_user', null);
    if (savedUser) return { user: savedUser, isNew: false };
    return {
      user: {
        id: 'dev_user_1',
        firstName: 'Ермек',
        lastName: '',
        username: 'ermek_dev',
        xp: 120,
        level: 'Любитель',
        direction: 'Full-stack',
        skillLevel: 'Любитель',
        onboardingCompleted: true,
        role: 'student',
        registeredEvents: ['kz_event_1'],
        bookmarks: ['kz_event_2'],
        streak: 3,
      },
      isNew: false
    };
  }
}

export async function completeOnboarding(direction, skillLevel, role = 'student') {
  const initData = getInitData();
  try {
    const { data } = await api.post('/auth/onboarding', { initData, direction, skillLevel, role });
    return data;
  } catch {
    const user = {
      id: 'user_' + Date.now(),
      firstName: 'Пользователь',
      lastName: '',
      username: 'student',
      xp: 50,
      level: skillLevel || 'Новичок',
      direction,
      skillLevel,
      onboardingCompleted: true,
      role,
      registeredEvents: [],
      bookmarks: [],
      streak: 1,
    };
    setStored('barinbil_user', user);
    return { success: true, user };
  }
}

// =================== EVENTS ===================
export async function getEvents() {
  try {
    const { data } = await api.get('/events');
    if (data?.events?.length > 0) return data;
  } catch {
    // Return local stored events
  }
  const events = getStored('barinbil_events', DEFAULT_EVENTS);
  return { success: true, events };
}

export async function createEvent(eventData) {
  const initData = getInitData();
  try {
    const { data } = await api.post('/events', eventData, {
      headers: { 'X-Telegram-Init-Data': initData }
    });
    return data;
  } catch {
    const events = getStored('barinbil_events', DEFAULT_EVENTS);
    const newEvent = {
      id: 'event_' + Date.now(),
      ...eventData,
      registrationCount: 1,
      createdAt: new Date().toISOString(),
    };
    events.unshift(newEvent);
    setStored('barinbil_events', events);
    return { success: true, event: newEvent };
  }
}

export async function registerForEvent(eventId) {
  const initData = getInitData();
  try {
    const { data } = await api.post(`/events/${eventId}/register`, {}, {
      headers: { 'X-Telegram-Init-Data': initData }
    });
    return data;
  } catch {
    const events = getStored('barinbil_events', DEFAULT_EVENTS);
    const event = events.find(e => e.id === eventId);
    if (event) {
      event.registrationCount = (event.registrationCount || 0) + 1;
      setStored('barinbil_events', events);
    }
    return { success: true, registered: true, xpAdded: 50 };
  }
}

// =================== TEAMS ===================
export async function getTeams() {
  const teams = getStored('barinbil_teams', DEFAULT_TEAMS);
  return { success: true, teams };
}

export async function createTeamPost(teamData) {
  const teams = getStored('barinbil_teams', DEFAULT_TEAMS);
  const newTeam = {
    id: 'team_' + Date.now(),
    ...teamData,
    currentMembers: 1,
    createdAt: 'Только что',
  };
  teams.unshift(newTeam);
  setStored('barinbil_teams', teams);
  return { success: true, team: newTeam };
}

// =================== LEADERBOARD & QUESTS ===================
export async function getLeaderboard() {
  const list = getStored('barinbil_leaderboard', DEFAULT_LEADERBOARD);
  return { success: true, leaderboard: list };
}

export async function getQuestsAndAchievements() {
  const quests = getStored('barinbil_quests', DEFAULT_QUESTS);
  const achievements = getStored('barinbil_achievements', DEFAULT_ACHIEVEMENTS);
  return { success: true, quests, achievements };
}

export async function claimQuestReward(questId) {
  const quests = getStored('barinbil_quests', DEFAULT_QUESTS);
  const q = quests.find(item => item.id === questId);
  if (q && !q.claimed) {
    q.claimed = true;
    q.completed = true;
    setStored('barinbil_quests', quests);
    return { success: true, xp: q.xp };
  }
  return { success: false, xp: 0 };
}

// =================== AI MENTOR & ROADMAP ===================
export async function getAIMentorInsight(eventDescription, userLevel = 'Любитель', userDirection = 'Full-stack') {
  const initData = getInitData();
  try {
    const { data } = await api.post('/ai/mentor', { eventDescription }, {
      headers: { 'X-Telegram-Init-Data': initData }
    });
    if (data?.insight) return data;
  } catch {
    // Generate high quality smart insight locally
  }

  return {
    success: true,
    insight: {
      title: `🎯 Идеальный ивент для твоего роста в ${userDirection}`,
      reason: `На уровне «${userLevel}» критически важно участвовать в таких проектах: это даст мощный нетворкинг и реальный кейс в портфолио для казахстанских и международных IT-компаний.`,
      skill: 'Практическая командная разработка и презентация решения',
      cta: 'Зарегистрируйся прямо сейчас и начни собирать команду! 🚀'
    }
  };
}

export async function generateCustomRoadmap(topic, userLevel = 'Любитель', direction = 'Full-stack') {
  // Simulates an intelligent AI Roadmap generation
  await new Promise(r => setTimeout(r, 600));

  return {
    success: true,
    roadmap: {
      topic: topic || 'Хакатон по AI и веб-разработке',
      steps: [
        {
          day: 'Этап 1 (За 3 дня)',
          title: 'Подготовка стека и темплейтов',
          description: `Настрой boilerplate на Vite/Next.js + Tailwind/CSS, подключи клиент OpenAI/Gemini SDK и подготовь чистый репозиторий.`,
          tags: ['Setup', 'Git', 'Boilerplate']
        },
        {
          day: 'Этап 2 (День 1 хакатона)',
          title: 'MVP & Архитектура ядра',
          description: `Фокусируйся строго на главной киллер-фиче. Сделай работающий прототип с AI за первые 6 часов.`,
          tags: ['Core MVP', 'Fast Prototyping']
        },
        {
          day: 'Этап 3 (День 2 хакатона)',
          title: 'UI/UX полишинг и демонстрационный питч',
          description: `Добавь интерактивные микроанимации, запиши видео-демо на случай падения бэкенда и подготовь презентацию из 5 слайдов.`,
          tags: ['Pitching', 'Demo', 'Win']
        }
      ]
    }
  };
}

export default api;
