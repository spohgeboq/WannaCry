// BarinBil — Главный компонент приложения
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import OnboardingPage from './pages/OnboardingPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import CreateEventPage from './pages/CreateEventPage';
import BottomNav from './components/BottomNav';
import DevToolbar from './components/DevToolbar';
import './App.css';

function AppRoutes() {
  const { user, loading, isOnboarded } = useUser();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-pulse-ring">⚡</div>
        <h3>BarinBil</h3>
        <p>Загрузка умной IT-платформы...</p>
      </div>
    );
  }

  // If onboarding not completed, show onboarding
  if (!isOnboarded) {
    return (
      <Routes>
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
    );
  }

  const isOrganizer = user?.role === 'organizer';

  return (
    <>
      <Routes>
        <Route path="/" element={<FeedPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        {isOrganizer && <Route path="/create" element={<CreateEventPage />} />}
        <Route path="/onboarding" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Bottom Navigation for mobile / Telegram app */}
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <UserProvider>
            <div className="barinbil-app-wrapper">
              <AppRoutes />
              {/* Floating Developer & Sandbox Toolbar */}
              <DevToolbar />
            </div>
          </UserProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
