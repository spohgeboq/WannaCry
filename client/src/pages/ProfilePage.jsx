// Страница профиля пользователя
import { useUser } from '../context/UserContext';
import XPBar from '../components/XPBar';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';

export default function ProfilePage() {
  const { user, xpProgress, logout } = useUser();
  const { showBackButton, onBackButtonClick } = useTelegram();
  const navigate = useNavigate();

  // Показать кнопку "Назад" в Telegram
  showBackButton();
  onBackButtonClick(() => navigate('/'));

  return (
    <div className="profile-page">
      <header className="app-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Назад</button>
        <h1 className="app-title">Профиль</h1>
      </header>

      <div className="profile-content">
        {/* Главная карточка профиля */}
        <div className="card profile-main-card">
          <div className="profile-avatar-large">
            {user?.firstName?.charAt(0) || '?'}
          </div>
          <h2 className="profile-name">
            {user?.firstName} {user?.lastName}
          </h2>
          {user?.username && (
            <p className="profile-username">@{user.username}</p>
          )}
          <div className="profile-level-badge">
            {user?.level || 'Новичок'}
          </div>
        </div>

        {/* Секция XP */}
        <div className="card profile-xp-card">
          <div className="xp-card-header">
            <span className="xp-card-title">Твой прогресс</span>
            <span className="xp-card-value">{user?.xp || 0} XP</span>
          </div>
          <XPBar />
          {xpProgress.nextLevel && (
            <p className="xp-next-level">
              До ранга <strong>«{xpProgress.nextLevel}»</strong> осталось {xpProgress.max - user.xp + 1} XP
            </p>
          )}
        </div>

        {/* Статистика */}
        <div className="card profile-stats-card">
          <div className="stat-box">
            <span className="stat-value">{user?.registeredEvents?.length || 0}</span>
            <span className="stat-label">Мероприятий</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-box">
            <span className="stat-value">{user?.role === 'organizer' ? 'Орг' : 'Студент'}</span>
            <span className="stat-label">Роль</span>
          </div>
        </div>

        {/* Детальная информация */}
        <div className="card profile-details-card">
          <div className="detail-row">
            <span className="detail-label">Направление</span>
            <span className="detail-value">{user?.direction || 'Не выбрано'}</span>
          </div>
          <div className="detail-divider" />
          <div className="detail-row">
            <span className="detail-label">Уровень навыков</span>
            <span className="detail-value">{user?.skillLevel || 'Не задан'}</span>
          </div>
        </div>

        {/* Действия */}
        <div className="profile-actions">
          <button className="btn btn-secondary logout-btn" onClick={logout}>
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
}
