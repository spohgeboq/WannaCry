import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { generateCustomRoadmap } from '../services/api';
import { sound } from '../services/soundEffects';

const QUICK_PROMPTS = [
  '🚀 Как выиграть хакатон по AI в Astana Hub?',
  '🗺️ Сгенерируй роадмап подготовки к хакатону',
  '💼 Как оформить портфолио джуну в Казахстане?',
  '🤖 Стек для Telegram Mini Apps на React + TON',
];

export default function AICoachModal() {
  const { user, addXP } = useUser();
  const { t } = useLanguage();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Привет, ${user?.firstName || 'друг'}! 👋 Я твой персональный AI-коуч в BarinBil. Твой текущий уровень — «${user?.level || 'Любитель'}», специализация — «${user?.direction || 'Full-stack'}». Чем я могу помочь сегодня?`,
    }
  ]);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSendPrompt = async (textToSend) => {
    const question = textToSend || prompt;
    if (!question.trim() || loading) return;

    sound.playClick();
    const userMsg = { sender: 'user', text: question };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      if (question.includes('роадмап') || question.includes('Roadmap') || question.includes('подготовки')) {
        const res = await generateCustomRoadmap(question, user?.level, user?.direction);
        setRoadmap(res.roadmap);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ai',
            text: `🎯 Я сгенерировал пошаговый план подготовки к хакатону специально под твой уровень «${user?.level}»! Посмотри этапы ниже 👇`,
          }
        ]);
        addXP(30);
        sound.playAchievement();
      } else {
        await new Promise(r => setTimeout(r, 700));
        let reply = '';
        if (question.includes('Astana Hub') || question.includes('выиграть')) {
          reply = `🏆 Чтобы победить на хакатоне в Astana Hub:\n\n1. **Решай реальную боль рынка** (финтех, медицина, образование Центральной Азии).\n2. **Работающий MVP > презентация**: жюри ценит живую демонстрацию работающего кода.\n3. **Telegram Mini App интерфейс**: мобильный доступ прямо из мессенджера дает огромный плюс к оценке UX!`;
        } else if (question.includes('портфолио') || question.includes('резюме')) {
          reply = `💼 Для сильного резюме разработчика:\n\n1. Добавь 2-3 ссылки на задеплоенные проекты (Vercel/Render) с исходным кодом на GitHub.\n2. Укажи участие в хакатонах из BarinBil и заработанный ранг («${user?.level}»).\n3. Опиши не просто стек, а конкретные метрики: "оптимизировал время загрузки на 40%".`;
        } else {
          reply = `💡 Отличный вопрос по направлению ${user?.direction || 'IT'}! Для решения этой задачи рекомендую сфокусироваться на чистой архитектуре компонентов, использовать типизацию TypeScript/JSDoc и протестировать UX с реальными пользователями. Задавай еще вопросы!`;
        }

        setMessages(prev => [...prev, { sender: 'ai', text: reply }]);
        addXP(20);
        sound.playXP();
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: 'Произошла ошибка связи с AI. Попробуйте еще раз.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-coach-page-container">
      {/* Header Banner */}
      <div className="ai-coach-banner">
        <div className="ai-coach-avatar-ring">🤖</div>
        <div className="ai-banner-info">
          <h2>{t('aiCoachTitle')}</h2>
          <p>Персональные советы, аудит и роадмапы подготовки</p>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="quick-prompts-scroll">
        {QUICK_PROMPTS.map((q, idx) => (
          <button
            key={idx}
            className="quick-prompt-pill"
            onClick={() => handleSendPrompt(q)}
            disabled={loading}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="ai-chat-messages-container">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.sender === 'user' ? 'user-msg' : 'ai-msg'}`}>
            {msg.sender === 'ai' && <span className="bubble-bot-icon">🤖</span>}
            <div className="bubble-text-content">
              {msg.text.split('\n').map((line, lIdx) => (
                <p key={lIdx} style={{ margin: '4px 0' }}>{line}</p>
              ))}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble ai-msg loading-msg">
            <span className="bubble-bot-icon">🤖</span>
            <div className="typing-dots">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      {/* Generated Roadmap Display */}
      {roadmap && (
        <div className="generated-roadmap-card">
          <div className="roadmap-head">
            <h3>🗺️ {t('roadmapTitle')}</h3>
            <span className="roadmap-topic-tag">{roadmap.topic}</span>
          </div>

          <div className="roadmap-steps-list">
            {roadmap.steps.map((step, idx) => (
              <div key={idx} className="roadmap-step-box">
                <div className="step-number-badge">{idx + 1}</div>
                <div className="step-details">
                  <span className="step-day-time">{step.day}</span>
                  <h4 className="step-title">{step.title}</h4>
                  <p className="step-desc">{step.description}</p>
                  <div className="step-tags-row">
                    {step.tags.map((tg, i) => (
                      <span key={i} className="step-tag-pill">{tg}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="ai-input-bottom-bar">
        <input
          type="text"
          className="ai-chat-input"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendPrompt()}
          placeholder={t('aiCoachPromptPlaceholder')}
          disabled={loading}
        />
        <button
          className="btn-ai-send"
          onClick={() => handleSendPrompt()}
          disabled={loading || !prompt.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
