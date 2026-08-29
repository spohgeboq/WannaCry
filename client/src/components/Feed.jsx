import { useState, useEffect, useMemo } from 'react';
import { getEvents } from '../services/api';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../services/soundEffects';
import EventCard from './EventCard';

export default function Feed() {
  const { user } = useUser();
  const { t } = useLanguage();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [onlyBeginner, setOnlyBeginner] = useState(false);
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const result = await getEvents();
      setEvents(result.events || []);
    } catch (err) {
      console.error('Ошибка загрузки ленты:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter & sort events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inTitle = e.title.toLowerCase().includes(query);
        const inDesc = e.description.toLowerCase().includes(query);
        const inTags = e.tags?.some(tag => tag.toLowerCase().includes(query));
        const inCity = e.city?.toLowerCase().includes(query);
        if (!inTitle && !inDesc && !inTags && !inCity) return false;
      }

      // Category
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'hackathon' && e.category !== 'hackathon') return false;
        if (selectedCategory === 'meetup' && e.category !== 'meetup') return false;
        if (selectedCategory === 'workshop' && e.category !== 'workshop') return false;
        if (selectedCategory === 'ai' && !e.tags?.some(t => ['AI', 'Python', 'LLM', 'Data Science'].includes(t))) return false;
        if (selectedCategory === 'web3' && !e.tags?.some(t => ['Web3', 'TON', 'Solidity', 'Blockchain'].includes(t))) return false;
        if (selectedCategory === 'design' && !e.tags?.some(t => ['Дизайн', 'UX/UI', 'Figma'].includes(t))) return false;
      }

      // City / Format
      if (selectedCity !== 'all') {
        if (selectedCity === 'Online' && !e.isOnline) return false;
        if (selectedCity === 'Almaty' && e.city !== 'Almaty') return false;
        if (selectedCity === 'Astana' && e.city !== 'Astana') return false;
      }

      // Beginner
      if (onlyBeginner && !e.beginnerFriendly) return false;

      // Bookmarks
      if (onlyBookmarked && !user?.bookmarks?.includes(e.id)) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') {
        return (b.registrationCount || 0) - (a.registrationCount || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === 'prize') {
        return (b.prizeNumber || 0) - (a.prizeNumber || 0);
      }
      return 0;
    });
  }, [events, searchQuery, selectedCategory, selectedCity, onlyBeginner, onlyBookmarked, sortBy, user?.bookmarks]);

  const categories = [
    { id: 'all', label: t('filterAll') },
    { id: 'hackathon', label: t('filterHackathon') },
    { id: 'meetup', label: t('filterMeetup') },
    { id: 'workshop', label: t('filterWorkshop') },
    { id: 'ai', label: t('filterAI') },
    { id: 'web3', label: t('filterWeb3') },
    { id: 'design', label: t('filterDesign') },
  ];

  return (
    <div className="feed-container">
      {/* Search Bar */}
      <div className="search-bar-wrapper">
        <div className="search-input-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="filter-chips-scroll">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`filter-chip ${selectedCategory === cat.id ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setSelectedCategory(cat.id);
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Subfilters Row: City, Beginner, Bookmarked & Sort */}
      <div className="feed-subfilters-row">
        <div className="subfilters-left">
          {/* City select */}
          <select
            className="dropdown-select-pill"
            value={selectedCity}
            onChange={(e) => {
              sound.playClick();
              setSelectedCity(e.target.value);
            }}
          >
            <option value="all">📍 {t('cityAll')}</option>
            <option value="Almaty">📍 {t('cityAlmaty')}</option>
            <option value="Astana">📍 {t('cityAstana')}</option>
            <option value="Online">🌐 {t('cityOnline')}</option>
          </select>

          {/* Beginner toggle */}
          <button
            className={`toggle-filter-pill ${onlyBeginner ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setOnlyBeginner(!onlyBeginner);
            }}
          >
            🌱 Новичкам
          </button>

          {/* Bookmarks toggle */}
          <button
            className={`toggle-filter-pill ${onlyBookmarked ? 'active' : ''}`}
            onClick={() => {
              sound.playClick();
              setOnlyBookmarked(!onlyBookmarked);
            }}
          >
            ★ Закладки ({user?.bookmarks?.length || 0})
          </button>
        </div>

        {/* Sort */}
        <div className="subfilters-right">
          <select
            className="dropdown-select-pill sort-pill"
            value={sortBy}
            onChange={(e) => {
              sound.playClick();
              setSortBy(e.target.value);
            }}
          >
            <option value="popular">🔥 {t('sortPopular')}</option>
            <option value="newest">⚡ {t('sortNewest')}</option>
            <option value="prize">💰 Призовой фонд</option>
          </select>
        </div>
      </div>

      {/* Feed Cards List */}
      {loading ? (
        <div className="feed-loading-container">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="feed-empty-box">
          <span className="empty-emoji">🔍</span>
          <h3>Событий не найдено</h3>
          <p>Попробуйте изменить параметры поиска или фильтры</p>
          <button
            className="btn-reset-filters"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedCity('all');
              setOnlyBeginner(false);
              setOnlyBookmarked(false);
            }}
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="feed-cards-grid">
          {filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
