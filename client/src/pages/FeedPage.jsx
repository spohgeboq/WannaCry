import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import XPBar from '../components/XPBar';
import Feed from '../components/Feed';
import TeamFinder from '../components/TeamFinder';
import QuestsAchievements from '../components/QuestsAchievements';
import AICoachModal from '../components/AICoachModal';
import ProfilePage from './ProfilePage';
import { useNavigate } from 'react-router-dom';
import { sound } from '../services/soundEffects';

export default function FeedPage() {
  const { user, activeTab, setActiveTab } = useUser();
  const { lang, setLang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const isOrganizer = user?.role === 'organizer';

  return (
    <div className="feed-page-layout">
      {/* Universal Sticky Header */}
      <header className="app-header-glass">
        <div className="header-brand-box" onClick={() => setActiveTab('feed')}>
          <div className="brand-logo-ring">⚡</div>
          <div className="brand-titles">
            <h1 className="brand-title">BarinBil</h1>
            <span className="brand-subtitle">Tech Events Hub</span>
          </div>
        </div>

        <div className="header-controls-row">
          {/* Language quick toggle */}
          <button
            className="header-lang-btn"
            onClick={() => {
              sound.playClick();
              setLang(lang === 'ru' ? 'kz' : lang === 'kz' ? 'en' : 'ru');
            }}
            title="Сменить язык"
          >
            {lang.toUpperCase()}
          </button>

          {/* Theme quick toggle */}
          <button
            className="header-theme-btn"
            onClick={() => {
              sound.playClick();
              toggleTheme();
            }}
            title="Переключить тему"
          >
            {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🔮'}
          </button>

          {/* Organizer create button */}
          {isOrganizer && (
            <button
              className="header-create-btn"
              onClick={() => {
                sound.playClick();
                navigate('/create');
              }}
            >
              + {t('createEvent')}
            </button>
          )}

          {/* Profile Avatar */}
          <button
            className={`header-avatar-circle ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => {
              sound.playSwitch();
              setActiveTab('profile');
            }}
          >
            {user?.firstName?.charAt(0) || '👤'}
          </button>
        </div>
      </header>

      {/* Dynamic View Tab Body */}
      <main className="tab-view-content">
        {activeTab === 'feed' && (
          <>
            <XPBar />
            <Feed />
          </>
        )}

        {activeTab === 'teams' && (
          <>
            <XPBar />
            <TeamFinder />
          </>
        )}

        {activeTab === 'quests' && (
          <>
            <XPBar />
            <QuestsAchievements />
          </>
        )}

        {activeTab === 'ai' && (
          <AICoachModal />
        )}

        {activeTab === 'profile' && (
          <ProfilePage />
        )}
      </main>
    </div>
  );
}
