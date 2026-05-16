// Компонент ленты мероприятий (бесконечная лента)
import { useState, useEffect } from 'react';
import { getEvents } from '../services/api';
import EventCard from './EventCard';

/**
 * Feed — бесконечная лента мероприятий (как в Threads).
 */
export default function Feed() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoading(true);
    try {
      const result = await getEvents(20);
      setEvents(result.events || []);
    } catch (err) {
      console.error('Ошибка загрузки ленты:', err);
      setError('Не удалось загрузить мероприятия');
      // Заглушка с демо-данными для разработки
      setEvents(getDemoEvents());
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="feed-loading">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    );
  }

  if (error && events.length === 0) {
    return (
      <div className="feed-error">
        <p>{error}</p>
        <button onClick={loadEvents}>Попробовать снова</button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="feed-empty">
        <p>Пока нет мероприятий</p>
        <p>Будьте первым организатором!</p>
      </div>
    );
  }

  return (
    <div className="feed">
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

/**
 * Демо-данные для разработки без бэкенда
 */
function getDemoEvents() {
  return [
    {
      id: 'demo_1',
      title: 'Хакатон: AI в образовании',
      description: 'Создайте инновационное решение для образования с использованием искусственного интеллекта. Призовой фонд 500,000 тенге. Формат: команды по 3-5 человек. Приглашаем разработчиков всех уровней!',
      tags: ['AI', 'Хакатон', 'Образование'],
      beginnerFriendly: true,
      organizerId: 'org_1',
      registrations: [],
      registrationCount: 42,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo_2',
      title: 'Meetup: Web3 и блокчейн для начинающих',
      description: 'Разберёмся в основах Web3, смарт-контрактов и децентрализованных приложений. Спикер — ведущий разработчик TON. Формат: лекция + практика.',
      tags: ['Web3', 'Blockchain', 'TON'],
      beginnerFriendly: true,
      organizerId: 'org_2',
      registrations: [],
      registrationCount: 28,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'demo_3',
      title: 'Workshop: Полный стек на React + Node.js',
      description: 'Практический воркшоп по созданию полноценного веб-приложения. Создадим проект от нуля до деплоя за 4 часа. Нужно: ноутбук с Node.js.',
      tags: ['React', 'Node.js', 'Full-stack'],
      beginnerFriendly: false,
      organizerId: 'org_3',
      registrations: [],
      registrationCount: 15,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'demo_4',
      title: 'Карьерный день: IT-компании Казахстана',
      description: 'Встретьтесь с HR и техлидами крупнейших IT-компаний страны. Возможность пройти мини-интервью и получить оффер прямо на месте.',
      tags: ['Карьера', 'HR', 'Networking'],
      beginnerFriendly: true,
      organizerId: 'org_4',
      registrations: [],
      registrationCount: 120,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ];
}
