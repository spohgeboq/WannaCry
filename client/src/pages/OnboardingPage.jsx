// Страница онбординга — 3 шага: роль → направление → уровень
import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useTelegram } from '../hooks/useTelegram';

// Роли
const ROLES = [
  { id: 'student', label: 'Участник', desc: 'Ищу мероприятия и развиваюсь' },
  { id: 'organizer', label: 'Организатор', desc: 'Создаю хакатоны и мероприятия' },
];

// Варианты направлений
const DIRECTIONS = [
  { id: 'fullstack', label: 'Full-stack' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'data', label: 'Data Science' },
  { id: 'design', label: 'UI/UX Дизайн' },
  { id: 'devops', label: 'DevOps' },
  { id: 'management', label: 'Менеджмент' },
];

// Уровни (шахматная система)
const SKILL_LEVELS = [
  { id: 'Новичок', label: 'Новичок', desc: 'Только начинаю изучать IT' },
  { id: 'Любитель', label: 'Любитель', desc: 'Есть базовые знания и проекты' },
  { id: 'Профи', label: 'Профи', desc: 'Уверенно работаю с технологиями' },
];

export default function OnboardingPage() {
  const { finishOnboarding, user } = useUser();
  const { haptic } = useTelegram();
  const [step, setStep] = useState(1); // 1 = роль, 2 = направление, 3 = уровень
  const [role, setRole] = useState(null);
  const [direction, setDirection] = useState(null);
  const [skillLevel, setSkillLevel] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectRole = (r) => {
    setRole(r);
    haptic.selection();
    setStep(2);
  };

  const handleSelectDirection = (dir) => {
    setDirection(dir);
    haptic.selection();
    setStep(3);
  };

  const handleSelectLevel = async (level) => {
    setSkillLevel(level);
    haptic.impact('heavy');
    setLoading(true);

    try {
      await finishOnboarding(direction.label, level.id, role.id);
      haptic.notification('success');
    } catch (err) {
      console.error('Ошибка онбординга:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <h1>Добро пожаловать{user?.firstName ? `, ${user.firstName}` : ''}</h1>
        <p className="onboarding-subtitle">Расскажи о себе, чтобы мы подобрали лучший опыт</p>
      </div>

      {/* Индикатор шагов */}
      <div className="onboarding-steps">
        <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
        <div className="step-line" />
        <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
        <div className="step-line" />
        <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
      </div>

      {/* Шаг 1: Выбор роли */}
      {step === 1 && (
        <div className="onboarding-section">
          <h2>Кто ты?</h2>
          <div className="onboarding-levels">
            {ROLES.map(r => (
              <button
                key={r.id}
                className={`onboarding-level ${role?.id === r.id ? 'selected' : ''}`}
                onClick={() => handleSelectRole(r)}
              >
                <div className="level-info">
                  <span className="level-label">{r.label}</span>
                  <span className="level-desc">{r.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Шаг 2: Выбор направления */}
      {step === 2 && (
        <div className="onboarding-section">
          <h2>Твоё направление в IT</h2>
          <p className="section-hint">Роль: {role?.label}</p>
          <div className="onboarding-options">
            {DIRECTIONS.map(dir => (
              <button
                key={dir.id}
                className={`onboarding-option ${direction?.id === dir.id ? 'selected' : ''}`}
                onClick={() => handleSelectDirection(dir)}
              >
                <span className="option-label">{dir.label}</span>
              </button>
            ))}
          </div>
          <button className="onboarding-back" onClick={() => setStep(1)}>
            ← Назад
          </button>
        </div>
      )}

      {/* Шаг 3: Выбор уровня */}
      {step === 3 && (
        <div className="onboarding-section">
          <h2>Твой уровень</h2>
          <p className="section-hint">{role?.label} · {direction?.label}</p>
          <div className="onboarding-levels">
            {SKILL_LEVELS.map(level => (
              <button
                key={level.id}
                className={`onboarding-level ${skillLevel?.id === level.id ? 'selected' : ''}`}
                onClick={() => handleSelectLevel(level)}
                disabled={loading}
              >
                <div className="level-info">
                  <span className="level-label">{level.label}</span>
                  <span className="level-desc">{level.desc}</span>
                </div>
              </button>
            ))}
          </div>
          <button className="onboarding-back" onClick={() => setStep(2)}>
            ← Назад
          </button>
          {loading && <div className="onboarding-loading">Сохраняем...</div>}
        </div>
      )}
    </div>
  );
}
