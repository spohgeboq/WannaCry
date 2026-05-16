// Компонент карточки мероприятия
import { useState } from 'react';
import { registerForEvent, getAIMentorInsight } from '../services/api';
import { useUser } from '../context/UserContext';
import { useTelegram } from '../hooks/useTelegram';

/**
 * EventCard — карточка мероприятия в ленте.
 * Содержит: заголовок, описание, теги, AI-наставник, кнопку регистрации.
 */
export default function EventCard({ event }) {
  const { user, addXP, addRegisteredEvent } = useUser();
  const { haptic } = useTelegram();

  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(
    user?.registeredEvents?.includes(event.id) || false
  );

  // Запросить AI-инсайт
  const handleGetInsight = async () => {
    if (aiInsight || loadingAI) return;
    setLoadingAI(true);
    try {
      const result = await getAIMentorInsight(event.description);
      setAiInsight(result.insight);
    } catch (err) {
      // Заглушка при ошибке
      setAiInsight({
        title: 'Это мероприятие для тебя',
        reason: 'Отличная возможность прокачать навыки.',
        skill: 'Практический опыт',
        cta: 'Не упусти шанс',
      });
    } finally {
      setLoadingAI(false);
    }
  };

  // Регистрация на ивент
  const handleRegister = async () => {
    if (registered || registering) return;
    setRegistering(true);
    haptic.impact('medium');

    try {
      await registerForEvent(event.id);
      setRegistered(true);
      addXP(50);
      addRegisteredEvent(event.id);
      haptic.notification('success');
    } catch (err) {
      console.error('Ошибка регистрации:', err);
      // Если ошибка — обновляем локально всё равно (для dev режима)
      setRegistered(true);
      addXP(50);
      addRegisteredEvent(event.id);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="event-card">
      <div className="event-author">
        <div className="author-avatar">{event.organizerId ? 'O' : 'U'}</div>
        <div className="author-info">
          <span className="author-name">Организатор</span>
          <span className="author-time">Сегодня</span>
        </div>
      </div>

      <div className="event-content">
        <h3 className="event-card-title">{event.title}</h3>
        {event.beginnerFriendly && (
          <span className="event-tag-beginner">Ждём новичков</span>
        )}
        <p className="event-card-description">{event.description}</p>

        {event.tags && event.tags.length > 0 && (
          <div className="event-tags">
            {event.tags.map((tag, i) => (
              <span key={i} className="tag">{tag}</span>
            ))}
          </div>
        )}

        <div className="ai-mentor-block">
          {!aiInsight && !loadingAI && (
            <button className="ai-mentor-btn" onClick={handleGetInsight}>
              Попросить совет
            </button>
          )}
          {loadingAI && (
            <div className="ai-mentor-loading">
              <span className="spinner" /> Анализ...
            </div>
          )}
          {aiInsight && (
            <div className="ai-mentor-insight">
              <div className="ai-insight-title">{aiInsight.title}</div>
              <div className="ai-insight-reason">{aiInsight.reason}</div>
              <div className="ai-insight-skill">
                Навык: <strong>{aiInsight.skill}</strong>
              </div>
              <div className="ai-insight-cta">{aiInsight.cta}</div>
            </div>
          )}
        </div>
      </div>

      <div className="event-footer">
        <span className="event-registrations">
          {event.registrationCount || 0} участников
        </span>
        <button
          className={`btn-primary ${registered ? 'registered' : ''}`}
          onClick={handleRegister}
          disabled={registered || registering}
        >
          {registered ? 'Вы записаны' : registering ? 'Загрузка...' : 'Участвовать (+50 XP)'}
        </button>
      </div>
    </div>
  );
}
