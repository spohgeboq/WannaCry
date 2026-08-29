import { useState, useEffect } from 'react';
import { getLeaderboard } from '../services/api';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../services/soundEffects';

export default function Leaderboard() {
  const { user } = useUser();
  const { t } = useLanguage();

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly'); // 'weekly' | 'alltime'

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getLeaderboard();
        setLeaderboard(res.leaderboard || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const restUsers = leaderboard.slice(3);

  // Reorder for podium presentation (2nd, 1st, 3rd)
  const podium = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="leaderboard-container">
      {/* Period switch */}
      <div className="leaderboard-period-row">
        <button
          className={`period-toggle-pill ${period === 'weekly' ? 'active' : ''}`}
          onClick={() => {
            sound.playClick();
            setPeriod('weekly');
          }}
        >
          ⚡ Недельная лига
        </button>
        <button
          className={`period-toggle-pill ${period === 'alltime' ? 'active' : ''}`}
          onClick={() => {
            sound.playClick();
            setPeriod('alltime');
          }}
        >
          🏆 За всё время
        </button>
      </div>

      {loading ? (
        <div className="feed-loading-container">
          <div className="skeleton-card" />
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          <div className="podium-stage">
            {podium.map((pUser, index) => {
              if (!pUser) return null;
              const isFirst = pUser.rank === 1;
              const isSecond = pUser.rank === 2;
              const isThird = pUser.rank === 3;

              return (
                <div
                  key={pUser.username}
                  className={`podium-column ${isFirst ? 'first-place' : isSecond ? 'second-place' : 'third-place'}`}
                >
                  <div className="podium-avatar-wrapper">
                    {isFirst && <span className="podium-crown">👑</span>}
                    <div className="podium-avatar">{pUser.avatar || '👤'}</div>
                    <span className="podium-rank-badge">#{pUser.rank}</span>
                  </div>

                  <span className="podium-user-name">{pUser.name.split(' ')[0]}</span>
                  <span className="podium-xp-score">{pUser.xp} XP</span>

                  <div className="podium-pedestal-box">
                    <span className="pedestal-number">
                      {isFirst ? '1st' : isSecond ? '2nd' : '3rd'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Leaderboard Table List (Rank #4+) */}
          <div className="leaderboard-list">
            {restUsers.map((item) => (
              <div key={item.rank} className="leaderboard-row-card">
                <span className="lb-rank-num">#{item.rank}</span>
                <div className="lb-user-avatar">{item.avatar || '👤'}</div>
                <div className="lb-user-details">
                  <span className="lb-user-fullname">{item.name}</span>
                  <span className="lb-user-meta">
                    🔥 {item.streak} дн. · 🎟️ {item.eventsAttended} ивентов · {item.level}
                  </span>
                </div>
                <span className="lb-user-xp">{item.xp} XP</span>
              </div>
            ))}
          </div>

          {/* Current User Fixed Position Strip */}
          {user && (
            <div className="current-user-rank-strip">
              <span className="cur-rank-badge">Твой ранг: #5</span>
              <div className="cur-avatar-thumb">👨‍💻</div>
              <div className="cur-user-info">
                <span className="cur-name">{user.firstName || 'Вы'} (Вы)</span>
                <span className="cur-level">{user.level} · {user.streak || 3} дн. стрик</span>
              </div>
              <span className="cur-score">{user.xp} XP</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
