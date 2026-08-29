import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { sound } from '../services/soundEffects';

export default function DevToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, toggleRole, addXP, resetOnboarding, soundEnabled, setSoundEnabled } = useUser();
  const { lang, setLang } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside aria-label="Панель разработчика" className={`dev-toolbar ${isOpen ? 'open' : 'collapsed'}`}>
      <button
        className="dev-toolbar-toggle-btn"
        onClick={() => {
          sound.playClick();
          setIsOpen(!isOpen);
        }}
        title="Панель тестирования BarinBil"
      >
        <span className="dev-toggle-icon">⚡</span>
        <span className="dev-toggle-text">Sandbox Dev</span>
      </button>

      {isOpen && (
        <div className="dev-toolbar-body">
          <div className="dev-toolbar-header">
            <h4>🛠️ Панель песочницы BarinBil</h4>
            <button className="dev-close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="dev-toolbar-grid">
            {/* Role switch */}
            <div className="dev-control-box">
              <label>Роль аккаунта:</label>
              <button className="dev-action-btn" onClick={toggleRole}>
                {user?.role === 'organizer' ? '🏢 Организатор' : '🎓 Участник'}
                <span className="dev-btn-hint">(Сменить)</span>
              </button>
            </div>

            {/* XP Boost */}
            <div className="dev-control-box">
              <label>XP Тест:</label>
              <div className="dev-btn-row">
                <button className="dev-action-btn-sm" onClick={() => addXP(50)}>+50 XP</button>
                <button className="dev-action-btn-sm" onClick={() => addXP(200)}>+200 XP 🚀</button>
              </div>
            </div>

            {/* Language */}
            <div className="dev-control-box">
              <label>Язык:</label>
              <div className="dev-btn-row">
                <button className={`dev-lang-btn ${lang === 'ru' ? 'active' : ''}`} onClick={() => setLang('ru')}>RU</button>
                <button className={`dev-lang-btn ${lang === 'kz' ? 'active' : ''}`} onClick={() => setLang('kz')}>KZ</button>
                <button className={`dev-lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
              </div>
            </div>

            {/* Theme */}
            <div className="dev-control-box">
              <label>Тема:</label>
              <button className="dev-action-btn" onClick={toggleTheme}>
                {theme === 'dark' && '🌙 Dark Theme'}
                {theme === 'light' && '☀️ Light Theme'}
                {theme === 'cyber' && '🔮 Cyber Neon'}
              </button>
            </div>

            {/* Sound */}
            <div className="dev-control-box">
              <label>Звуки Web Audio:</label>
              <button
                className={`dev-action-btn ${soundEnabled ? 'active' : ''}`}
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? '🔊 Звуки включены' : '🔇 Без звука'}
              </button>
            </div>

            {/* Reset Onboarding */}
            <div className="dev-control-box">
              <button className="dev-reset-btn" onClick={resetOnboarding}>
                🔄 Перезапустить онбординг
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
