CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL DEFAULT '',
  last_name VARCHAR(255) DEFAULT '',
  username VARCHAR(255) DEFAULT '',
  photo_url TEXT DEFAULT '',
  xp INTEGER DEFAULT 0,
  level VARCHAR(50) DEFAULT 'beginner',
  direction VARCHAR(100),
  skill_level VARCHAR(50),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  beginner_friendly BOOLEAN DEFAULT FALSE,
  organizer_id BIGINT REFERENCES users(telegram_id),
  registration_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  user_telegram_id BIGINT REFERENCES users(telegram_id),
  event_id INTEGER REFERENCES events(id),
  xp_earned INTEGER DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_telegram_id, event_id)
);
