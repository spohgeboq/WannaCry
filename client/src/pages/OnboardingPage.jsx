import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useTelegram } from '../hooks/useTelegram';
import { sound } from '../services/soundEffects';

const ROLES = [
  { id: 'student', icon: '🎓', label: 'Участник', desc: 'Ищу хакатоны, митапы, команду и прокачиваю навыки' },
  { id: 'organizer', icon: '🏢', label: 'Организатор', desc: 'Создаю IT-мероприятия, хакатоны и привлекаю таланты' },
];

const DIRECTIONS = [
  { id: 'fullstack', icon: '🌐', label: 'Full-stack' },
  { id: 'frontend', icon: '⚛️', label: 'Frontend' },
  { id: 'backend', icon: '⚙️', label: 'Backend' },
  { id: 'ai', icon: '🤖', label: 'AI & Data Science' },
  { id: 'mobile', icon: '📱', label: 'Mobile (iOS/Android)' },
  { id: 'design', icon: '🎨', label: 'UI/UX Дизайн' },
  { id: 'web3', icon: '⛓️', label: 'Web3 & TON' },
  { id: 'devops', icon: '☁️', label: 'Cloud & DevOps' },
];

const SKILL_LEVELS = [
  { id: 'Новичок', icon: '🌱', label: 'Новичок', desc: 'Только начинаю путь в IT, хочу участвовать в первых ивентах' },
  { id: 'Любитель', icon: '⚡', label: 'Любитель', desc: 'Есть пет-проекты и база, готов побеждать на хакатонах' },
  { id: 'Профи', icon: '🔥', label: 'Профи', desc: 'Опыт коммерческой разработки, ищу топ-нетворкинг и хардкор-кейсы' },
];

export default function OnboardingPage() {
  const { finishOnboarding, user } = useUser();
  const { lang, setLang, t } = useLanguage();
  const { haptic } = useTelegram();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);
  const [direction, setDirection] = useState(null);
  const [skillLevel, setSkillLevel] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectRole = (r) => {
    sound.playClick();
    setRole(r);
    haptic.selection();
    setStep(2);
  };

  const handleSelectDirection = (dir) => {
    sound.playClick();
    setDirection(dir);
    haptic.selection();
    setStep(3);
  };

  const handleSelectLevel = async (level) => {
    sound.playClick();
    setSkillLevel(level);
    haptic.impact('heavy');
    setLoading(true);

    try {
      await finishOnboarding(direction?.label || 'Full-stack', level.id, role?.id || 'student');
      haptic.notification('success');
    } catch (err) {
      console.error('Ошибка онбординга:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page-container">
      {/* Top Language bar */}
      <div className="onboarding-top-bar">
        <div className="brand-pill-mini">⚡ BarinBil</div>
        <div className="lang-pill-selector">
          <button className={`lang-mini-btn ${lang === 'ru' ? 'active' : ''}`} onClick={() => setLang('ru')}>RU</button>
          <button className={`lang-mini-btn ${lang === 'kz' ? 'active' : ''}`} onClick={() => setLang('kz')}>KZ</button>
          <button className={`lang-mini-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>EN</button>
        </div>
      </div>

      {/* Header Info */}
      <div className="onboarding-hero-header">
        <h1>{t('onboardingTitle')}</h1>
        <p>{t('onboardingSub')}</p>
      </div>

      {/* Progress Dots */}
      <div className="onboarding-progress-steps">
        <div className={`progress-step-pill ${step >= 1 ? 'active' : ''}`}>1. {t('stepRole')}</div>
        <div className={`progress-step-pill ${step >= 2 ? 'active' : ''}`}>2. {t('stepDirection')}</div>
        <div className={`progress-step-pill ${step >= 3 ? 'active' : ''}`}>3. {t('stepLevel')}</div>
      </div>

      {/* Step 1: Role Selection */}
      {step === 1 && (
        <div className="onboarding-step-section">
          <h2>{t('stepRole')}</h2>
          <div className="onboarding-role-cards">
            {ROLES.map(r => (
              <button
                key={r.id}
                className={`onboarding-role-card ${role?.id === r.id ? 'selected' : ''}`}
                onClick={() => handleSelectRole(r)}
              >
                <span className="role-card-icon">{r.icon}</span>
                <div className="role-card-text">
                  <span className="role-card-title">{r.label}</span>
                  <span className="role-card-desc">{r.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Direction Selection */}
      {step === 2 && (
        <div className="onboarding-step-section">
          <h2>{t('stepDirection')}</h2>
          <p className="step-hint">Выбрано: <strong>{role?.label}</strong></p>

          <div className="onboarding-direction-grid">
            {DIRECTIONS.map(dir => (
              <button
                key={dir.id}
                className={`direction-grid-card ${direction?.id === dir.id ? 'selected' : ''}`}
                onClick={() => handleSelectDirection(dir)}
              >
                <span className="dir-icon">{dir.icon}</span>
                <span className="dir-name">{dir.label}</span>
              </button>
            ))}
          </div>

          <button className="btn-onboarding-back" onClick={() => setStep(1)}>
            ← {t('back')}
          </button>
        </div>
      )}

      {/* Step 3: Skill Level Selection */}
      {step === 3 && (
        <div className="onboarding-step-section">
          <h2>{t('stepLevel')}</h2>
          <p className="step-hint">{role?.label} · {direction?.label}</p>

          <div className="onboarding-level-cards">
            {SKILL_LEVELS.map(lvl => (
              <button
                key={lvl.id}
                className={`onboarding-level-card ${skillLevel?.id === lvl.id ? 'selected' : ''}`}
                onClick={() => handleSelectLevel(lvl)}
                disabled={loading}
              >
                <span className="level-card-icon">{lvl.icon}</span>
                <div className="level-card-text">
                  <span className="level-card-title">{lvl.label}</span>
                  <span className="level-card-desc">{lvl.desc}</span>
                </div>
              </button>
            ))}
          </div>

          <button className="btn-onboarding-back" onClick={() => setStep(2)}>
            ← {t('back')}
          </button>

          {loading && (
            <div className="onboarding-loading-indicator">
              <span className="spinner" /> {t('saving')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
