// PostgreSQL — подключение через pg Pool
import pg from 'pg';
const { Pool } = pg;

let pool = null;

/**
 * Создаёт и возвращает пул подключений к PostgreSQL.
 */
export function getPool() {
  if (pool) return pool;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  pool.on('connect', () => {
    console.log('[DB] PostgreSQL подключён');
  });

  pool.on('error', (err) => {
    console.error('[DB] Ошибка PostgreSQL:', err.message);
  });

  return pool;
}

/**
 * Выполняет SQL запрос.
 * @param {string} text — SQL запрос
 * @param {Array} params — параметры запроса
 * @returns {object} — результат запроса
 */
export async function query(text, params) {
  const p = getPool();
  const result = await p.query(text, params);
  return result;
}

/**
 * Закрывает пул подключений.
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
