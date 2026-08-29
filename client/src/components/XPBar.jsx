import { useUser, LEVELS } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../services/soundEffects';

export default function XPBar() {
  const { user, xpProgress, addXP } = useUser();
  const { t } = useLanguage();

  if (!user) return null;

  const currentLevelInfo = LEVELS[user.level] || LEVELS['Новичок'];

  return (
    <div className="xp-container" onClick={() => sound.playClick()}>
      <div className="xp-glass-card">
        {/* Top Info: Rank Badge & Streak */}
        <div className="xp-card-top">
          <div className="xp-rank-pill" style={{ borderColor: currentLevelInfo.color }}>
            <span className="rank-icon">{currentLevelInfo.icon}</span>
            <span className="rank-title">{user.level}</span>
          </div>

          <div className="xp-streak-pill" title="Ежедневный стрик посещений">
            <span className="streak-flame">🔥</span>
            <span className="streak-days">{user.streak || 1} {t('dailyStreak')}</span>
          </div>
        </div>

        {/* Center Progress bar */}
        <div className="xp-gauge-wrapper">
          <div className="xp-gauge-labels">
            <span className="xp-current-score">
              <strong>{user.xp}</strong> XP
            </span>
            <span className="xp-next-target">
              {xpProgress.nextLevel ? (
                <span>До <strong>{xpProgress.nextLevel}</strong>: {xpProgress.remaining} XP</span>
              ) : (
                <span className="max-rank-text">👑 Максимальный ранг</span>
              )}
            </span>
          </div>

          <div className="xp-track-bar">
            <div
              className="xp-fill-animated"
              style={{
                width: `${xpProgress.percent}%`,
                background: `linear-gradient(90deg, #f97316 0%, ${currentLevelInfo.color} 100%)`
              }}
            >
              <div className="xp-fill-glow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
