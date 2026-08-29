import { useState, useEffect } from 'react';
import { getQuestsAndAchievements, claimQuestReward } from '../services/api';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../services/soundEffects';
import { fireConfetti } from '../services/confetti';
import Leaderboard from './Leaderboard';

export default function QuestsAchievements() {
  const { user, addXP } = useUser();
  const { t } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState('quests'); // 'quests' | 'leaderboard'
  const [quests, setQuests] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getQuestsAndAchievements();
      setQuests(res.quests || []);
      setAchievements(res.achievements || []);
    } catch (err) {
      console.error('Ошибка загрузки квестов:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleClaimQuest = async (questId) => {
    sound.playClick();
    try {
      const res = await claimQuestReward(questId);
      if (res.success) {
        addXP(res.xp);
        sound.playLevelUp();
        fireConfetti({ count: 70 });
        setQuests(prev => prev.map(q => q.id === questId ? { ...q, claimed: true, completed: true } : q));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unlockedCount = achievements.filter(a => a.unlocked || (a.id === 'ach_2' && user?.registeredEvents?.length > 0) || (a.id === 'ach_5' && user?.streak >= 3)).length;
  const achievementsPercent = Math.round((unlockedCount / (achievements.length || 1)) * 100);

  return (
    <div className="quests-page-container">
      {/* Subtab Toggle (Квесты & Достижения / Таблица Лидеров) */}
      <div className="quests-subnav-bar">
        <button
          className={`subnav-pill-btn ${activeSubTab === 'quests' ? 'active' : ''}`}
          onClick={() => {
            sound.playSwitch();
            setActiveSubTab('quests');
          }}
        >
          🎯 Квесты и Ачивки
        </button>
        <button
          className={`subnav-pill-btn ${activeSubTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => {
            sound.playSwitch();
            setActiveSubTab('leaderboard');
          }}
        >
          🏆 {t('leaderboardTitle')}
        </button>
      </div>

      {activeSubTab === 'leaderboard' ? (
        <Leaderboard />
      ) : (
        <div className="quests-content-scroll">
          {/* Daily Streak Highlight Card */}
          <div className="streak-glass-banner">
            <div className="streak-fire-large">🔥</div>
            <div className="streak-text-box">
              <h3>{user?.streak || 1} {t('dailyStreak')} подряд!</h3>
              <p>Заходи каждый день в BarinBil, чтобы получать бонусный множитель XP</p>
            </div>
            <div className="streak-badge-pill">
              +{20 * (user?.streak || 1)} XP бонус
            </div>
          </div>

          {/* Daily Quests List */}
          <div className="quests-section-block">
            <div className="section-title-row">
              <h3>⚡ Ежедневные задания</h3>
              <span className="reset-timer-tag">Обновление в 00:00</span>
            </div>

            <div className="quests-list">
              {quests.map(quest => {
                const isAutoDone = (quest.id === 'q1') || (quest.id === 'q3' && user?.registeredEvents?.length > 0);
                const isCompleted = quest.completed || isAutoDone;

                return (
                  <div key={quest.id} className={`quest-item-card ${quest.claimed ? 'claimed' : ''}`}>
                    <div className="quest-icon-box">{quest.icon}</div>
                    <div className="quest-info-box">
                      <span className="quest-title">{quest.title}</span>
                      <span className="quest-reward-val">+{quest.xp} XP</span>
                    </div>
                    <button
                      className={`btn-claim-quest ${quest.claimed ? 'claimed' : isCompleted ? 'ready' : ''}`}
                      onClick={() => handleClaimQuest(quest.id)}
                      disabled={quest.claimed || !isCompleted}
                    >
                      {quest.claimed ? '✓ Получено' : isCompleted ? `Забрать +${quest.xp}` : 'В процессе'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Achievements Collection Showcase */}
          <div className="quests-section-block">
            <div className="section-title-row">
              <h3>🎖️ Коллекция достижений</h3>
              <span className="achievements-count-tag">{unlockedCount} / {achievements.length}</span>
            </div>

            {/* Achievements progress */}
            <div className="ach-progress-bar-wrap">
              <div className="ach-track">
                <div className="ach-fill" style={{ width: `${achievementsPercent}%` }} />
              </div>
            </div>

            <div className="achievements-grid">
              {achievements.map(ach => {
                const isUnlocked = ach.unlocked || (ach.id === 'ach_2' && user?.registeredEvents?.length > 0) || (ach.id === 'ach_5' && (user?.streak || 0) >= 3);

                return (
                  <div key={ach.id} className={`achievement-badge-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                    <div className="ach-badge-avatar">
                      {isUnlocked ? ach.icon : '🔒'}
                    </div>
                    <div className="ach-badge-details">
                      <span className="ach-name">{ach.title}</span>
                      <span className="ach-desc">{ach.desc}</span>
                    </div>
                    <div className="ach-reward-pill">
                      {isUnlocked ? '✓ Открыто' : `+${ach.xp} XP`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
