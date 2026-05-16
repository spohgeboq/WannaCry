// OpenAI сервис — AI-наставник для BarinBil
import OpenAI from 'openai';

let client = null;

/**
 * Инициализирует OpenAI клиент.
 */
function getClient() {
  if (client) return client;
  
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'sk-your_openai_api_key_here') {
    console.warn('[OPENAI] API ключ не задан — AI-функции будут возвращать заглушки');
    return null;
  }

  client = new OpenAI({ apiKey });
  return client;
}

/**
 * Промпт №1: AI-Наставник для ленты.
 * Переписывает описание мероприятия в персонализированный инсайт.
 * 
 * @param {string} eventDescription — сырое описание мероприятия
 * @param {string} userLevel — уровень пользователя (Новичок, Любитель, Профи)
 * @param {string} userDirection — направление (Full-stack, Дизайн и т.д.)
 * @returns {string} — персонализированное описание
 */
export async function generateMentorInsight(eventDescription, userLevel, userDirection) {
  const openai = getClient();

  if (!openai) {
    // Заглушка для разработки без API ключа
    return {
      title: '🎯 Это мероприятие для тебя!',
      reason: `Идеально подходит для уровня "${userLevel}" в направлении "${userDirection}".`,
      skill: 'Практический опыт',
      cta: 'Не упусти шанс прокачаться! 🚀',
    };
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Ты дружелюбный карьерный ИИ-наставник в IT.
Контекст: Пользователь просматривает ленту мероприятий. Уровень: ${userLevel}, специализация: ${userDirection}.
Задача: Проанализируй сырое описание IT-мероприятия и создай короткое, цепляющее приглашение, адаптированное под уровень пользователя.
Ограничение: Не более 4 предложений. Без воды.
Формат ответа (JSON):
{
  "title": "Заголовок",
  "reason": "Почему это круто для его уровня",
  "skill": "Главный навык",
  "cta": "Мотивирующий призыв"
}`,
      },
      {
        role: 'user',
        content: eventDescription,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 300,
    temperature: 0.7,
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return {
      title: '🎯 Интересное мероприятие!',
      reason: response.choices[0].message.content,
      skill: 'IT',
      cta: 'Попробуй — это может изменить твой путь!',
    };
  }
}

/**
 * Промпт №2: Рефлексия после мероприятия.
 * Задаёт вопрос для самоанализа и поздравляет с XP.
 * 
 * @param {string} eventTitle — название мероприятия
 * @param {string} userLevel — уровень пользователя
 * @param {number} xpEarned — количество заработанных XP
 * @returns {string} — сообщение рефлексии
 */
export async function generateReflection(eventTitle, userLevel, xpEarned) {
  const openai = getClient();

  if (!openai) {
    return {
      congratulation: `🎉 +${xpEarned} XP! Отлично, что ты сходил на "${eventTitle}"!`,
      question: 'Какой главный инсайт ты вынес с этого мероприятия?',
    };
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Ты IT-коуч.
Контекст: Пользователь завершил участие в мероприятии "${eventTitle}".
Задача: Задай пользователю короткий вопрос для рефлексии о прошедшем мероприятии и поздравь с получением ${xpEarned} баллов.
Уровень пользователя: ${userLevel}.
Ограничение: Максимум 2 предложения.
Формат ответа (JSON):
{
  "congratulation": "Поздравление с начислением XP",
  "question": "Один открытый вопрос об инсайтах"
}`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 200,
    temperature: 0.7,
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch {
    return {
      congratulation: `🎉 +${xpEarned} XP за "${eventTitle}"!`,
      question: 'Что нового ты узнал на этом мероприятии?',
    };
  }
}
