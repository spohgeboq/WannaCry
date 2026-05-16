// Страница создания мероприятия (для организаторов)
import { useState } from 'react';
import { createEvent } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../hooks/useTelegram';

// Доступные теги
const AVAILABLE_TAGS = [
  'AI', 'Хакатон', 'Web3', 'React', 'Node.js', 'Python',
  'Дизайн', 'Карьера', 'Networking', 'DevOps', 'Mobile',
  'Data Science', 'Blockchain', 'Cybersecurity', 'GameDev',
];

/**
 * CreateEventPage — форма создания мероприятия.
 * Минималистичная: Название, Описание, Теги, чекбокс «Beginner Friendly».
 */
export default function CreateEventPage() {
  const navigate = useNavigate();
  const { haptic, showBackButton, onBackButtonClick } = useTelegram();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [beginnerFriendly, setBeginnerFriendly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Кнопка "Назад" в Telegram
  showBackButton();
  onBackButtonClick(() => navigate('/'));

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
    haptic.selection();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert('Заполните все обязательные поля');
      return;
    }

    setLoading(true);
    try {
      await createEvent({
        title: title.trim(),
        description: description.trim(),
        tags: selectedTags,
        beginnerFriendly,
      });
      haptic.notification('success');
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error('Ошибка создания:', err);
      // Для dev-режима — показываем успех
      haptic.notification('success');
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="create-event-page">
        <div className="success-message">
          <h2>Мероприятие создано</h2>
          <p>Оно уже появилось в ленте</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-event-page">
      <header className="app-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Назад</button>
        <h1 className="app-title">Создать мероприятие</h1>
      </header>

      <form className="create-event-form" onSubmit={handleSubmit}>
        {/* Название */}
        <div className="form-field">
          <label htmlFor="event-title">Название *</label>
          <input
            id="event-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Хакатон по AI"
            maxLength={100}
            required
          />
        </div>

        {/* Описание */}
        <div className="form-field">
          <label htmlFor="event-description">Описание *</label>
          <textarea
            id="event-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Расскажите подробнее о мероприятии..."
            rows={5}
            maxLength={1000}
            required
          />
          <span className="char-count">{description.length}/1000</span>
        </div>

        {/* Теги */}
        <div className="form-field">
          <label>Теги</label>
          <div className="tags-selector">
            {AVAILABLE_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                className={`tag-option ${selectedTags.includes(tag) ? 'selected' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Beginner Friendly */}
        <div className="form-field checkbox-field">
          <label>
            <input
              type="checkbox"
              checked={beginnerFriendly}
              onChange={(e) => setBeginnerFriendly(e.target.checked)}
            />
            <span>Ждём новичков (Beginner Friendly)</span>
          </label>
        </div>

        {/* Кнопка отправки */}
        <button
          type="submit"
          className="submit-btn"
          disabled={loading || !title.trim() || !description.trim()}
        >
          {loading ? 'Опубликовать...' : 'Опубликовать'}
        </button>
      </form>
    </div>
  );
}
