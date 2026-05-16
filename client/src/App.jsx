// BarinBil — Главный компонент приложения
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import OnboardingPage from './pages/OnboardingPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import CreateEventPage from './pages/CreateEventPage';
import './App.css';

/**
 * AppRoutes — маршрутизация с разделением по ролям.
 * Студенты НЕ видят страницу создания мероприятий.
 */
function AppRoutes() {
  const { user, loading, isOnboarded } = useUser();

  // Пока загружается пользователь — показать загрузку
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Загрузка BarinBil...</p>
      </div>
    );
  }

  // Если онбординг не пройден — перенаправляем
  if (!isOnboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  const isOrganizer = user?.role === 'organizer';

  // Основные маршруты
  return (
    <Routes>
      <Route path="/" element={<FeedPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      {/* Только организатор видит страницу создания */}
      {isOrganizer && <Route path="/create" element={<CreateEventPage />} />}
      <Route path="/onboarding" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * App — корневой компонент.
 */
function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
