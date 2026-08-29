import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useTelegram } from '../hooks/useTelegram';
import { registerForEvent } from '../services/api';
import { sound } from '../services/soundEffects';
import { fireConfetti } from '../services/confetti';
import EventDetailModal from './EventDetailModal';

export default function EventCard({ event }) {
  const { user, addXP, addRegisteredEvent, toggleBookmark } = useUser();
  const { t } = useLanguage();
  const { haptic } = useTelegram();

  const [registering, setRegistering] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const isRegistered = user?.registeredEvents?.includes(event.id);
  const isBookmarked = user?.bookmarks?.includes(event.id);

  const handleRegister = async (e) => {
    e.stopPropagation();
    if (isRegistered || registering) return;

    setRegistering(true);
    sound.playClick();
    haptic.impact('heavy');

    try {
      await registerForEvent(event.id);
      addRegisteredEvent(event.id);
      addXP(50);
      sound.playLevelUp();
      fireConfetti({ count: 70 });
      haptic.notification('success');
    } catch {
      addRegisteredEvent(event.id);
      addXP(50);
      sound.playLevelUp();
      fireConfetti({ count: 70 });
    } finally {
      setRegistering(false);
    }
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    toggleBookmark(event.id);
  };

  const openDetails = () => {
    sound.playClick();
    setShowDetail(true);
  };

  return (
    <>
      <article className="event-glass-card" onClick={openDetails}>
        {/* Top Badges & Bookmark */}
        <div className="event-card-header-bar">
          <div className="header-tags-cluster">
            {event.category === 'hackathon' && <span className="badge-pill badge-hackathon">🏆 Хакатон</span>}
            {event.category === 'meetup' && <span className="badge-pill badge-meetup">🎤 Митап</span>}
            {event.category === 'workshop' && <span className="badge-pill badge-workshop">💻 Воркшоп</span>}
            {event.city && (
              <span className="badge-pill badge-location">
                {event.isOnline ? '🌐 Онлайн' : `📍 ${event.city}`}
              </span>
            )}
            {event.beginnerFriendly && (
              <span className="badge-pill badge-beginner">🌱 Для новичков</span>
            )}
          </div>

          <button
            className={`btn-bookmark-icon ${isBookmarked ? 'active' : ''}`}
            onClick={handleBookmark}
            title={isBookmarked ? 'Удалить из закладок' : 'В закладки'}
          >
            {isBookmarked ? '★' : '☆'}
          </button>
        </div>

        {/* Prize Pool Spotlight */}
        {event.prizePool && (
          <div className="card-prize-banner">
            <span className="prize-icon">💰</span>
            <span className="prize-text">
              Призовой фонд: <strong>{event.prizePool}</strong>
            </span>
          </div>
        )}

        {/* Title & Body */}
        <div className="event-card-main">
          <h3 className="event-card-title">{event.title}</h3>
          <p className="event-card-snippet">{event.description}</p>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="event-tags-row">
            {event.tags.slice(0, 4).map((tag, i) => (
              <span key={i} className="tech-pill">{tag}</span>
            ))}
            {event.tags.length > 4 && (
              <span className="tech-pill-more">+{event.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="event-card-footer" onClick={(e) => e.stopPropagation()}>
          <div className="event-registrations-info" onClick={openDetails}>
            <span className="reg-icon">👥</span>
            <span className="reg-text">{event.registrationCount || 0} {t('registeredCount')}</span>
          </div>

          <div className="event-footer-buttons">
            <button className="btn-detail-preview" onClick={openDetails}>
              Детали
            </button>
            <button
              className={`btn-action-register ${isRegistered ? 'registered' : ''}`}
              onClick={handleRegister}
              disabled={isRegistered || registering}
            >
              {isRegistered ? `✓ ${t('registered')}` : registering ? 'Запись...' : t('registerBtn')}
            </button>
          </div>
        </div>
      </article>

      {showDetail && (
        <EventDetailModal event={event} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
