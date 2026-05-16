// Компонент XP Bar — шкала прогресса в шапке
import { useUser } from '../context/UserContext';

/**
 * XPBar — визуализирует прогресс XP и текущий уровень.
 * Всегда висит в верхней шапке профиля.
 */
export default function XPBar() {
  const { user, xpProgress } = useUser();

  if (!user) return null;

  // Эмодзи для уровней (шахматная система)
  const levelEmoji = {
    'Новичок': '♟️',
    'Любитель': '♞',
    'Профи': '♛',
  };

  return (
    <div className="xp-bar-container">
      <div className="xp-bar-header">
        <span className="xp-level">
          {levelEmoji[user.level] || '♟️'} {user.level}
        </span>
        <span className="xp-count">{user.xp} XP</span>
      </div>
      <div className="xp-bar-track">
        <div
          className="xp-bar-fill"
          style={{ width: `${xpProgress.percent}%` }}
        />
      </div>
      {xpProgress.nextLevel && (
        <div className="xp-bar-footer">
          До «{xpProgress.nextLevel}» осталось {xpProgress.max - user.xp + 1} XP
        </div>
      )}
    </div>
  );
}
