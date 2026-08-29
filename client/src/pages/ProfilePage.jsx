import { useState } from 'react';
import { useUser, LEVELS } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/soundEffects';
import XPBar from '../components/XPBar';

export default function ProfilePage() {
  const { user, xpProgress, logout, soundEnabled, setSoundEnabled, toggleRole } = useUser();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [selectedTicket, setSelectedTicket] = useState(null);

  if (!user) return null;

  const currentLevelInfo = LEVELS[user.level] || LEVELS['Новичок'];

  return (
    <div className="profile-page-view">
      {/* Main Profile Header Card */}
      <div className="profile-card-glass">
        <div className="profile-avatar-giant-wrapper">
          <div
            className="profile-avatar-giant"
            style={{ borderColor: currentLevelInfo.color }}
          >
            {user.firstName ? user.firstName.charAt(0) : '👨‍💻'}
          </div>
          <span className="profile-tier-floating-icon">{currentLevelInfo.icon}</span>
        </div>

        <h2 className="profile-fullname">{user.firstName} {user.lastName}</h2>
        {user.username && <p className="profile-handle">@{user.username}</p>}

        <div className="profile-badges-row">
          <span className="profile-rank-badge" style={{ backgroundColor: currentLevelInfo.color }}>
            {user.level}
          </span>
          <button className="profile-role-toggle-chip" onClick={toggleRole}>
            {user.role === 'organizer' ? '🏢 Организатор' : '🎓 Участник'} ⇄
          </button>
        </div>
      </div>

      {/* XP Progression Box */}
      <XPBar />

      {/* Stats Counters Grid */}
      <div className="profile-stats-grid">
        <div className="profile-stat-box">
          <span className="p-stat-icon">🎟️</span>
          <span className="p-stat-value">{user.registeredEvents?.length || 0}</span>
          <span className="p-stat-title">Билетов</span>
        </div>
        <div className="profile-stat-box">
          <span className="p-stat-icon">🔥</span>
          <span className="p-stat-value">{user.streak || 1}</span>
          <span className="p-stat-title">Дней стрик</span>
        </div>
        <div className="profile-stat-box">
          <span className="p-stat-icon">★</span>
          <span className="p-stat-value">{user.bookmarks?.length || 0}</span>
          <span className="p-stat-title">Закладок</span>
        </div>
        <div className="profile-stat-box">
          <span className="p-stat-icon">⚡</span>
          <span className="p-stat-value">{user.xp || 0}</span>
          <span className="p-stat-title">Всего XP</span>
        </div>
      </div>

      {/* Tickets & Registered Events Showcase */}
      <div className="profile-section-card">
        <div className="section-title-row">
          <h3>🎟️ {t('myRegistrations')}</h3>
          <span className="ticket-count-pill">{user.registeredEvents?.length || 0}</span>
        </div>

        {(!user.registeredEvents || user.registeredEvents.length === 0) ? (
          <div className="tickets-empty-state">
            <p>У вас пока нет активных билетов на мероприятия</p>
          </div>
        ) : (
          <div className="tickets-carousel">
            {user.registeredEvents.map((eventId, idx) => (
              <div
                key={idx}
                className="event-ticket-pass"
                onClick={() => {
                  sound.playClick();
                  setSelectedTicket({ id: eventId, seat: `SEAT-${100 + idx}`, code: `BB-2026-${eventId}` });
                }}
              >
                <div className="ticket-left">
                  <span className="ticket-tag">BARINBIL PASS</span>
                  <h4 className="ticket-title">
                    {eventId === 'kz_event_1' ? 'Astana Hub AI Hackathon' : 'Kolesa Conf 2026'}
                  </h4>
                  <span className="ticket-date">Март 2026 · Офлайн</span>
                </div>
                <div className="ticket-stub">
                  <span className="qr-mini-icon">▦</span>
                  <span className="qr-view-text">QR Билет</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skill Matrix */}
      <div className="profile-section-card">
        <h3>💡 {t('skillMatrix')}</h3>
        <div className="skills-tags-cluster">
          <span className="skill-chip primary">Направление: {user.direction || 'Full-stack'}</span>
          <span className="skill-chip">Уровень: {user.skillLevel || 'Любитель'}</span>
          <span className="skill-chip">React 19</span>
          <span className="skill-chip">TypeScript</span>
          <span className="skill-chip">Node.js</span>
          <span className="skill-chip">Telegram Apps</span>
          <span className="skill-chip">LLM / AI Tools</span>
        </div>
      </div>

      {/* Preferences & Settings */}
      <div className="profile-section-card">
        <h3>⚙️ Настройки приложения</h3>

        <div className="settings-list">
          {/* Sound Toggle */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Звуковые эффекты</span>
              <span className="setting-desc">Web Audio звуки кликов и начисления XP</span>
            </div>
            <button
              className={`toggle-switch-btn ${soundEnabled ? 'on' : 'off'}`}
              onClick={() => {
                sound.playClick();
                setSoundEnabled(!soundEnabled);
              }}
            >
              {soundEnabled ? 'ВКЛ' : 'ВЫКЛ'}
            </button>
          </div>

          {/* Language Switch */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Язык интерфейса</span>
              <span className="setting-desc">Русский / Қазақша / English</span>
            </div>
            <div className="lang-buttons-pill-group">
              <button className={`lang-pill ${lang === 'ru' ? 'active' : ''}`} onClick={() => setLang('ru')}>RU</button>
              <button className={`lang-pill ${lang === 'kz' ? 'active' : ''}`} onClick={() => setLang('kz')}>KZ</button>
              <button className={`lang-pill ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
            </div>
          </div>

          {/* Theme Switch */}
          <div className="setting-row">
            <div className="setting-info">
              <span className="setting-title">Тема оформления</span>
              <span className="setting-desc">Dark / Light / Cyber-OLED</span>
            </div>
            <button className="theme-toggle-chip" onClick={toggleTheme}>
              {theme === 'dark' ? '🌙 Dark' : theme === 'light' ? '☀️ Light' : '🔮 Cyber'}
            </button>
          </div>
        </div>

        {/* Logout */}
        <div className="logout-box">
          <button className="btn-profile-logout" onClick={logout}>
            🚪 {t('logout')}
          </button>
        </div>
      </div>

      {/* Ticket QR Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal-content ticket-qr-modal" onClick={e => e.stopPropagation()}>
            <div className="ticket-qr-header">
              <h3>Электронный QR-билет</h3>
              <button className="modal-close-circle" onClick={() => setSelectedTicket(null)}>✕</button>
            </div>
            <div className="ticket-qr-body">
              <div className="fake-qr-code">
                <span className="qr-symbol">▦ ▣ ▤ ▥</span>
                <span className="qr-code-string">{selectedTicket.code}</span>
              </div>
              <p className="qr-instructions">
                Покажите этот QR-код на стойке регистрации для получения бейджа участника и мерча.
              </p>
              <div className="qr-ticket-meta">
                <span>Участник: <strong>{user.firstName} {user.lastName}</strong></span>
                <span>Ранг: <strong>{user.level}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
