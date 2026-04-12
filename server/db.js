// SQLite 데이터베이스 초기화 및 쿼리 모듈
const Database = require('better-sqlite3');
const path = require('path');

// 환경변수에서 DB 경로를 읽거나 기본값 사용
const dbPath = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, 'database.sqlite'); // server/ 폴더 내 기본 위치

// DB 연결 (파일이 없으면 자동 생성)
const db = new Database(dbPath);

// WAL 모드 활성화 (동시 읽기 성능 향상)
db.pragma('journal_mode = WAL');

// daily_quotes 테이블 생성 (이미 존재하면 무시)
db.exec(`
  CREATE TABLE IF NOT EXISTS daily_quotes (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    date_key        TEXT    NOT NULL UNIQUE,   -- MM-DD 형식
    person_name     TEXT    NOT NULL,
    birth_year      TEXT,
    death_year      TEXT,                       -- 생존 인물이면 NULL
    nationality     TEXT,
    bio             TEXT,
    quote_original  TEXT,
    quote_korean    TEXT,
    connection_type TEXT,                       -- 'birthday' / 'deathday' / 'historical_event'
    connection_desc TEXT,
    created_at      TEXT    DEFAULT (datetime('now', 'localtime'))
  )
`);

/**
 * 날짜 키(MM-DD)로 저장된 명언 데이터를 조회한다.
 * @param {string} dateKey - 'MM-DD' 형식
 * @returns {object|undefined} 조회 결과 row 또는 undefined
 */
function getByDateKey(dateKey) {
  const stmt = db.prepare('SELECT * FROM daily_quotes WHERE date_key = ?');
  return stmt.get(dateKey);
}

/**
 * AI 응답 데이터를 DB에 삽입한다.
 * 이미 같은 date_key가 존재하면 무시(IGNORE)한다.
 * @param {object} data - AI가 반환한 파싱된 JSON 객체
 * @returns {object} 삽입 결과 (lastInsertRowid 등)
 */
function insertQuote(data) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO daily_quotes
      (date_key, person_name, birth_year, death_year, nationality,
       bio, quote_original, quote_korean, connection_type, connection_desc)
    VALUES
      (@date_key, @person_name, @birth_year, @death_year, @nationality,
       @bio, @quote_original, @quote_korean, @connection_type, @connection_desc)
  `);
  return stmt.run(data);
}

module.exports = { getByDateKey, insertQuote };
