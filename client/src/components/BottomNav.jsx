import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../services/soundEffects';

export default function BottomNav() {
  const { activeTab, setActiveTab, user } = useUser();
  const { t } = useLanguage();

  const handleTabClick = (tabId) => {
    if (activeTab !== tabId) {
      sound.playSwitch();
      setActiveTab(tabId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'feed', label: t('navFeed'), icon: '🧭' },
    { id: 'teams', label: t('navTeams'), icon: '👥', badge: 'New' },
    { id: 'quests', label: t('navQuests'), icon: '🏆' },
    { id: 'ai', label: t('navAI'), icon: '🤖' },
    { id: 'profile', label: t('navProfile'), icon: '👤' },
  ];

  return (
    <nav className="bottom-nav-container">
      <div className="bottom-nav-glass">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-tab-button ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(item.id)}
            >
              <div className="nav-icon-box">
                <span className="nav-tab-emoji">{item.icon}</span>
                {item.badge && !isActive && (
                  <span className="nav-badge-dot">{item.badge}</span>
                )}
                {isActive && <div className="nav-active-glow" />}
              </div>
              <span className="nav-tab-title">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
