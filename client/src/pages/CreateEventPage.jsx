import { useState } from 'react';
import { createEvent } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../services/soundEffects';
import { fireConfetti } from '../services/confetti';

const AVAILABLE_TAGS = [
  'AI', 'Хакатон', 'Web3', 'React', 'Node.js', 'Python',
  'Дизайн', 'Карьера', 'Networking', 'DevOps', 'Mobile',
  'Data Science', 'TON', 'Solidity', 'Kubernetes', 'Cybersecurity',
];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { haptic, showBackButton, onBackButtonClick } = useTelegram();
  const { t } = useLanguage();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('hackathon');
  const [city, setCity] = useState('Almaty');
  const [locationName, setLocationName] = useState('');
  const [prizePool, setPrizePool] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(150);
  const [selectedTags, setSelectedTags] = useState(['AI', 'Хакатон']);
  const [beginnerFriendly, setBeginnerFriendly] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  showBackButton();
  onBackButtonClick(() => navigate('/'));

  const toggleTag = (tag) => {
    sound.playClick();
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Заполните все обязательные поля');
      return;
    }

    setLoading(true);
    sound.playClick();

    try {
      await createEvent({
        title: title.trim(),
        description: description.trim(),
        category,
        city: city === 'Online' ? 'Online' : city,
        isOnline: city === 'Online',
        locationName: locationName.trim() || (city === 'Online' ? 'Online Stream' : `${city}, IT Hub`),
        prizePool: prizePool.trim() ? prizePool.trim() : null,
        prizeNumber: prizePool.includes('₸') ? parseInt(prizePool.replace(/\D/g, '')) : 0,
        maxParticipants: Number(maxParticipants) || 100,
        tags: selectedTags,
        beginnerFriendly,
      });

      sound.playLevelUp();
      fireConfetti({ count: 90 });
      haptic.notification('success');
      setSuccess(true);
      setTimeout(() => navigate('/'), 1800);
    } catch (err) {
      console.error(err);
      sound.playLevelUp();
      setSuccess(true);
      setTimeout(() => navigate('/'), 1800);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="create-event-page">
        <div className="success-banner-card">
          <span className="success-party-emoji">🎉</span>
          <h2>Мероприятие успешно создано!</h2>
          <p>Оно мгновенно опубликовано в общей ленте BarinBil.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-event-page">
      <header className="app-header-glass">
        <button className="back-nav-btn" onClick={() => navigate('/')}>
          ← {t('back')}
        </button>
        <h2 className="header-page-title">{t('createEvent')}</h2>
      </header>

      <form className="create-event-form" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="form-field">
          <label>Название мероприятия *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Например: Astana AI Hackathon 2026"
            maxLength={120}
            required
          />
        </div>

        {/* Category & City */}
        <div className="form-row-2col">
          <div className="form-field">
            <label>Тип события</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="hackathon">🏆 Хакатон</option>
              <option value="meetup">🎤 Митап</option>
              <option value="workshop">💻 Воркшоп</option>
            </select>
          </div>

          <div className="form-field">
            <label>Город / Формат</label>
            <select value={city} onChange={e => setCity(e.target.value)}>
              <option value="Almaty">Алматы</option>
              <option value="Astana">Астана</option>
              <option value="Online">🌐 Онлайн трансляция</option>
            </select>
          </div>
        </div>

        {/* Location Name & Prize Pool */}
        <div className="form-row-2col">
          <div className="form-field">
            <label>Адрес / Место проведения</label>
            <input
              type="text"
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
              placeholder="Например: Astana Hub, Блок C4"
            />
          </div>

          <div className="form-field">
            <label>Призовой фонд (если есть)</label>
            <input
              type="text"
              value={prizePool}
              onChange={e => setPrizePool(e.target.value)}
              placeholder="₸ 1,000,000 или Merch Box"
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-field">
          <label>Описание и требования *</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Подробно расскажите о формате, правилах, менторах и целях..."
            rows={5}
            maxLength={1200}
            required
          />
          <span className="char-counter">{description.length}/1200</span>
        </div>

        {/* Tags */}
        <div className="form-field">
          <label>Тематические теги</label>
          <div className="tags-selector-cloud">
            {AVAILABLE_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                className={`tag-chip-btn ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Beginner Friendly */}
        <div className="checkbox-custom-card">
          <label className="checkbox-label-row">
            <input
              type="checkbox"
              checked={beginnerFriendly}
              onChange={e => setBeginnerFriendly(e.target.checked)}
            />
            <div className="checkbox-text-info">
              <span className="cb-main">Ждём новичков (Beginner Friendly) 🌱</span>
              <span className="cb-sub">Будут менторы, которые помогут сформировать команду с нуля</span>
            </div>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn-publish-event"
          disabled={loading || !title.trim() || !description.trim()}
        >
          {loading ? 'Публикация в ленте...' : 'Опубликовать мероприятие'}
        </button>
      </form>
    </div>
  );
}
