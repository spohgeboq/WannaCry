// Страница ленты мероприятий
import { useUser } from '../context/UserContext';
import XPBar from '../components/XPBar';
import Feed from '../components/Feed';
import { useNavigate } from 'react-router-dom';

/**
 * FeedPage — основная страница приложения.
 * Навигация различается по ролям:
 *  - Участник: Лента + Профиль
 *  - Организатор: Лента + Создать + Профиль
 */
export default function FeedPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const isOrganizer = user?.role === 'organizer';

  return (
    <div className="feed-page">
      {/* Шапка с XP */}
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">BarinBil</h1>
          <span className="role-badge">
            {isOrganizer ? 'Организатор' : 'Участник'}
          </span>
        </div>
        <div className="header-right">
          <button className="profile-btn" onClick={() => navigate('/profile')}>
            <span className="profile-avatar">
              {user?.firstName?.charAt(0) || '?'}
            </span>
          </button>
        </div>
      </header>

      {/* XP Bar */}
      <XPBar />

      {/* Навигация — различается по ролям */}
      {isOrganizer && (
        <nav className="feed-nav">
          <button className="nav-btn active">Все мероприятия</button>
          <button className="nav-btn" onClick={() => navigate('/create')}>
            + Создать
          </button>
        </nav>
      )}

      {/* Лента мероприятий */}
      <Feed />
    </div>
  );
}
