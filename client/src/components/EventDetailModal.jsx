import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { registerForEvent, getAIMentorInsight } from '../services/api';
import { useTelegram } from '../hooks/useTelegram';
import { sound } from '../services/soundEffects';
import { fireConfetti } from '../services/confetti';

export default function EventDetailModal({ event, onClose }) {
  const { user, addXP, addRegisteredEvent, toggleBookmark } = useUser();
  const { t } = useLanguage();
  const { haptic } = useTelegram();

  const [registering, setRegistering] = useState(false);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  if (!event) return null;

  const isRegistered = user?.registeredEvents?.includes(event.id);
  const isBookmarked = user?.bookmarks?.includes(event.id);

  const handleRegister = async () => {
    if (isRegistered || registering) return;
    setRegistering(true);
    sound.playClick();
    haptic.impact('heavy');

    try {
      await registerForEvent(event.id);
      addRegisteredEvent(event.id);
      addXP(50);
      sound.playLevelUp();
      fireConfetti({ count: 80 });
      haptic.notification('success');
    } catch {
      addRegisteredEvent(event.id);
      addXP(50);
      sound.playLevelUp();
      fireConfetti({ count: 80 });
    } finally {
      setRegistering(false);
    }
  };

  const handleFetchAI = async () => {
    if (aiInsight || loadingAI) return;
    setLoadingAI(true);
    sound.playClick();
    try {
      const res = await getAIMentorInsight(event.description, user?.level, user?.direction);
      setAiInsight(res.insight);
      sound.playAchievement();
    } catch {
      setAiInsight({
        title: '🎯 Рекомендовано для твоего трека',
        reason: 'Этот ивент укрепит твои навыки командной разработки и ускорит рост.',
        skill: 'Архитектура и командный запуск MVP',
        cta: 'Обязательно регистрируйся и готовь проект!'
      });
    } finally {
      setLoadingAI(false);
    }
  };

  // Google Calendar generator
  const createGoogleCalendarLink = () => {
    const title = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description + '\n\nПлатформа: BarinBil');
    const location = encodeURIComponent(event.locationName || event.city);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  };

  // Share to Telegram
  const shareToTelegram = () => {
    const shareText = encodeURIComponent(`🔥 Иду на мероприятие "${event.title}" в BarinBil! Присоединяйся:`);
    const shareUrl = encodeURIComponent(window.location.href);
    window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`, '_blank');
    sound.playClick();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content event-detail-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header bar */}
        <div className="modal-top-bar">
          <span className="modal-category-tag">
            {event.category === 'hackathon' && '🏆 Хакатон'}
            {event.category === 'meetup' && '🎤 Митап'}
            {event.category === 'workshop' && '💻 Воркшоп'}
            {!event.category && '⚡ Событие'}
          </span>
          <div className="modal-actions-right">
            <button
              className={`bookmark-circle-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={() => toggleBookmark(event.id)}
              title={isBookmarked ? t('bookmarked') : t('saveBookmark')}
            >
              {isBookmarked ? '★' : '☆'}
            </button>
            <button className="modal-close-circle" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Title & Organization */}
        <div className="modal-body-scroll">
          <h2 className="detail-event-title">{event.title}</h2>
          
          <div className="detail-organizer-row">
            <span className="organizer-badge-icon">🏢</span>
            <span className="organizer-badge-name">{event.organizerName || 'BarinBil Tech Community'}</span>
            {event.beginnerFriendly && (
              <span className="beginner-chip">🌱 Beginner Friendly</span>
            )}
          </div>

          {/* Quick Info Grid (Prize, City, Format, Date) */}
          <div className="event-meta-grid">
            {event.prizePool && (
              <div className="meta-box prize-highlight">
                <span className="meta-label">{t('prizePool')}</span>
                <span className="meta-val prize-val">{event.prizePool}</span>
              </div>
            )}
            <div className="meta-box">
              <span className="meta-label">Локация</span>
              <span className="meta-val">
                {event.isOnline ? '🌐 Онлайн' : `📍 ${event.city}`}
              </span>
            </div>
            <div className="meta-box">
              <span className="meta-label">Участников</span>
              <span className="meta-val">👥 {event.registrationCount || 0} / {event.maxParticipants || 200}</span>
            </div>
            <div className="meta-box">
              <span className="meta-label">Адрес / Ссылка</span>
              <span className="meta-val location-small">{event.locationName || 'Онлайн трансляция'}</span>
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="event-tags-row">
              {event.tags.map((tag, i) => (
                <span key={i} className="tech-pill">{tag}</span>
              ))}
            </div>
          )}

          {/* Full Description */}
          <div className="detail-section">
            <h4 className="section-heading">О мероприятии</h4>
            <p className="detail-description-text">{event.description}</p>
          </div>

          {/* AI Mentor Assistant */}
          <div className="detail-ai-box">
            <div className="detail-ai-header">
              <span className="ai-spark-icon">✨</span>
              <span className="ai-box-title">AI-Советник BarinBil</span>
            </div>
            {!aiInsight && !loadingAI && (
              <button className="btn-ai-prompt" onClick={handleFetchAI}>
                Получить персональный совет для твоего уровня ({user?.level || 'Новичок'})
              </button>
            )}
            {loadingAI && (
              <div className="ai-loading-state">
                <span className="spinner" /> Анализируем требования и генерируем рекомендации...
              </div>
            )}
            {aiInsight && (
              <div className="ai-insight-result">
                <div className="ai-res-title">{aiInsight.title}</div>
                <div className="ai-res-reason">{aiInsight.reason}</div>
                <div className="ai-res-skill">
                  💡 <strong>Фокус навыков:</strong> {aiInsight.skill}
                </div>
                <div className="ai-res-cta">{aiInsight.cta}</div>
              </div>
            )}
          </div>

          {/* Agenda / Schedule Timeline */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="detail-section">
              <h4 className="section-heading">📅 {t('agenda')}</h4>
              <div className="agenda-timeline">
                {event.agenda.map((item, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot" />
                    <div className="timeline-content">
                      <span className="timeline-time">{item.time}</span>
                      <span className="timeline-text">{item.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speakers */}
          {event.speakers && event.speakers.length > 0 && (
            <div className="detail-section">
              <h4 className="section-heading">🎤 {t('speakers')}</h4>
              <div className="speakers-grid">
                {event.speakers.map((sp, idx) => (
                  <div key={idx} className="speaker-card">
                    <span className="speaker-avatar">{sp.avatar || '👨‍💻'}</span>
                    <div className="speaker-info">
                      <span className="speaker-name">{sp.name}</span>
                      <span className="speaker-role">{sp.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export & Share buttons */}
          <div className="detail-utility-buttons">
            <a
              href={createGoogleCalendarLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="util-btn calendar-btn"
              onClick={() => sound.playClick()}
            >
              📅 {t('addToCalendar')}
            </a>
            <button className="util-btn share-btn" onClick={shareToTelegram}>
              ✈️ {t('shareTelegram')}
            </button>
          </div>
        </div>

        {/* Footer sticky CTA */}
        <div className="modal-sticky-footer">
          <button
            className={`btn-modal-register ${isRegistered ? 'registered' : ''}`}
            onClick={handleRegister}
            disabled={isRegistered || registering}
          >
            {isRegistered ? `✓ ${t('registered')}` : registering ? 'Запись...' : t('registerBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
