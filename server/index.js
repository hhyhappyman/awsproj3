// Express 서버 진입점 — 정적 파일 서빙 + API 라우터 연결

// server/.env 로드 (서버 전용 변수: API 키, 포트, DB 경로)
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

// client/.env 로드 (클라이언트 공개 변수: API_BASE_URL 등)
// override: false → server/.env에서 이미 설정된 값은 덮어쓰지 않음
require('dotenv').config({ path: require('path').join(__dirname, '../client/.env'), override: false });

const express = require('express');
const cors = require('cors');
const path = require('path');
const quoteRouter = require('./routes/quote');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── 미들웨어 ────────────────────────────────────────────────
// JSON 요청 파싱
app.use(express.json());

// CORS 설정: 로컬 개발 환경(모든 출처) 허용
app.use(cors());

// ─── 정적 파일 서빙 ──────────────────────────────────────────
// 서버가 client/ 폴더의 HTML/CSS/JS를 직접 서빙하여
// 별도의 파일 서버 없이 브라우저에서 바로 사용 가능
app.use(express.static(path.join(__dirname, '../client')));

// ─── 클라이언트 공개 설정 엔드포인트 ─────────────────────────
// 민감하지 않은 클라이언트 설정값만 노출 (API 키 등 절대 포함 금지)
app.get('/api/config', (req, res) => {
  res.json({
    apiBaseUrl: process.env.API_BASE_URL || '',
  });
});

// ─── API 라우터 ───────────────────────────────────────────────
app.use('/api/quote', quoteRouter);

// ─── 루트 외 모든 GET 요청 → index.html 반환 (SPA 대응) ──────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// ─── 서버 시작 ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ 서버가 실행 중입니다: http://localhost:${PORT}`);
  console.log(`   클라이언트: http://localhost:${PORT}`);
  console.log(`   API 예시:   http://localhost:${PORT}/api/quote?date=04-11`);
});
