import { useState, useEffect } from 'react';
import { getTeams, createTeamPost } from '../services/api';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../services/soundEffects';
import { fireConfetti } from '../services/confetti';

const ROLE_OPTIONS = [
  'Frontend (React)',
  'Backend (Node/Python/Go)',
  'Mobile (Flutter/Swift)',
  'UI/UX Дизайнер',
  'AI / ML Инженер',
  'Smart Contracts (TON/Solidity)',
  'Project Manager',
];

export default function TeamFinder() {
  const { user, addXP } = useUser();
  const { t } = useLanguage();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New post form state
  const [eventTitle, setEventTitle] = useState('Astana Hub AI & LLM Hackathon');
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [telegramUsername, setTelegramUsername] = useState(user?.username || '');
  const [neededRoles, setNeededRoles] = useState([]);
  const [maxMembers, setMaxMembers] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    setLoading(true);
    try {
      const res = await getTeams();
      setTeams(res.teams || []);
    } catch (err) {
      console.error('Ошибка загрузки команд:', err);
    } finally {
      setLoading(false);
    }
  }

  const toggleRoleSelection = (role) => {
    setNeededRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
    sound.playClick();
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || !description.trim() || !telegramUsername.trim()) {
      alert('Заполните все обязательные поля');
      return;
    }

    setSubmitting(true);
    sound.playClick();

    try {
      const newPost = {
        eventTitle,
        teamName: teamName.trim(),
        authorName: user?.firstName || 'Разработчик',
        authorRole: user?.direction || 'Full-stack',
        authorTelegram: telegramUsername.replace('@', '').trim(),
        maxMembers: Number(maxMembers) || 4,
        description: description.trim(),
        neededRoles: neededRoles.length > 0 ? neededRoles : ['Frontend', 'Backend'],
      };

      await createTeamPost(newPost);
      addXP(40);
      sound.playLevelUp();
      fireConfetti({ count: 70 });
      setShowCreateModal(false);
      // Reset form
      setTeamName('');
      setDescription('');
      setNeededRoles([]);
      loadTeams();
    } catch (err) {
      console.error('Ошибка создания анкеты:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTeams = teams.filter(team => {
    if (selectedRoleFilter === 'all') return true;
    return team.neededRoles?.some(r => r.toLowerCase().includes(selectedRoleFilter.toLowerCase()));
  });

  return (
    <div className="team-finder-container">
      {/* Header Banner */}
      <div className="team-finder-banner">
        <div className="banner-text">
          <h2>🤝 {t('teamFinderTitle')}</h2>
          <p>Собери команду мечты или присоединяйся к крутым проектам</p>
        </div>
        <button
          className="btn-create-team-post"
          onClick={() => {
            sound.playClick();
            setShowCreateModal(true);
          }}
        >
          {t('createTeamPost')}
        </button>
      </div>

      {/* Role Filter Chips */}
      <div className="filter-chips-scroll">
        <button
          className={`filter-chip ${selectedRoleFilter === 'all' ? 'active' : ''}`}
          onClick={() => {
            sound.playClick();
            setSelectedRoleFilter('all');
          }}
        >
          Все роли
        </button>
        {['Frontend', 'Backend', 'Дизайн', 'AI / ML', 'Smart Contracts', 'Mobile'].map(role => (
          <button
            key={role}
            className={`filter-chip ${selectedRoleFilter === role ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setSelectedRoleFilter(role);
            }}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="feed-loading-container">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="feed-empty-box">
          <span className="empty-emoji">👥</span>
          <h3>Анкет пока нет</h3>
          <p>Будь первым — создай анкету поиска команды и получи +40 XP!</p>
          <button className="btn-reset-filters" onClick={() => setShowCreateModal(true)}>
            Создать анкету
          </button>
        </div>
      ) : (
        <div className="team-cards-grid">
          {filteredTeams.map(team => (
            <div key={team.id} className="team-card-glass">
              {/* Event title tag */}
              <div className="team-card-event-badge">
                <span className="event-icon">🏆</span>
                <span className="event-name">{team.eventTitle}</span>
              </div>

              {/* Team title & members */}
              <div className="team-card-head">
                <div className="team-name-box">
                  <h3 className="team-title">{team.teamName}</h3>
                  <span className="team-author">Автор: {team.authorName} ({team.authorRole})</span>
                </div>
                <div className="team-members-pill">
                  👥 {team.currentMembers} / {team.maxMembers}
                </div>
              </div>

              {/* Description */}
              <p className="team-desc">{team.description}</p>

              {/* Needed Roles */}
              <div className="team-roles-section">
                <span className="roles-label">{t('neededRoles')}:</span>
                <div className="roles-tags-row">
                  {team.neededRoles?.map((r, i) => (
                    <span key={i} className="needed-role-chip">{r}</span>
                  ))}
                </div>
              </div>

              {/* Footer with Telegram button */}
              <div className="team-card-footer">
                <span className="team-created-time">🕒 {team.createdAt}</span>
                <a
                  href={`https://t.me/${team.authorTelegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tg-contact"
                  onClick={() => sound.playClick()}
                >
                  💬 {t('contactInTg')} (@{team.authorTelegram})
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content team-modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-top-bar">
              <h3>Создать анкету поиска команды</h3>
              <button className="modal-close-circle" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>

            <form className="team-create-form" onSubmit={handleCreateTeam}>
              <div className="form-field">
                <label>Ивент / Хакатон *</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  placeholder="Название хакатона"
                  required
                />
              </div>

              <div className="form-field">
                <label>Название команды *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  placeholder="Например: CyberNomads"
                  required
                />
              </div>

              <div className="form-field">
                <label>Твой Telegram Username *</label>
                <input
                  type="text"
                  value={telegramUsername}
                  onChange={e => setTelegramUsername(e.target.value)}
                  placeholder="username_without_at"
                  required
                />
              </div>

              <div className="form-field">
                <label>Кого ищете в команду?</label>
                <div className="roles-selector-grid">
                  {ROLE_OPTIONS.map(role => (
                    <button
                      key={role}
                      type="button"
                      className={`role-select-chip ${neededRoles.includes(role) ? 'selected' : ''}`}
                      onClick={() => toggleRoleSelection(role)}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label>Описание проекта и цели *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Расскажите о вашей идее, текущем прогрессе и требованиях..."
                  rows={3}
                  required
                />
              </div>

              <div className="form-field">
                <label>Максимум участников в команде: {maxMembers}</label>
                <input
                  type="range"
                  min={2}
                  max={6}
                  value={maxMembers}
                  onChange={e => setMaxMembers(e.target.value)}
                />
              </div>

              <button type="submit" className="btn-modal-register" disabled={submitting}>
                {submitting ? 'Публикация...' : 'Опубликовать анкету (+40 XP)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
