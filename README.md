# 오늘의 인물 명언

오늘 날짜에 태어났거나 사망한 유명 인물의 명언과 소개를 보여주는 웹 애플리케이션입니다.  
해당 날짜에 관련 인물이 없으면 그날 발생한 중요한 역사적 사건과 연관된 인물을 대신 표시합니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 클라이언트 | React 18, Vite |
| 서버 | Node.js + Express.js |
| 데이터베이스 | SQLite (better-sqlite3) |
| AI API | Anthropic Claude (claude-sonnet-4-20250514) |

---

## 프로젝트 구조

```
project-root/
├── client/                   # React 클라이언트 (Vite)
│   ├── src/
│   │   ├── App.jsx           # 루트 컴포넌트 (탭 네비게이션)
│   │   ├── App.css           # 전역 스타일
│   │   ├── api.js            # API 호출 모듈
│   │   ├── components/
│   │   │   └── QuoteCard.jsx # 명언 카드 컴포넌트
│   │   └── pages/
│   │       ├── QuotePage.jsx # 오늘의 명언 페이지
│   │       └── HistoryPage.jsx # 명언 히스토리 페이지
│   ├── .env.example          # 클라이언트 환경변수 예시
│   └── index.html
├── server/
│   ├── index.js              # Express 서버 진입점
│   ├── db.js                 # SQLite 초기화 및 쿼리
│   ├── ai.js                 # Claude AI API 호출 모듈
│   └── routes/
│       └── quote.js          # /api/quote 라우터
├── .gitignore
└── README.md
```

---

## 실행 방법

### 1. 환경변수 설정

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

각 `.env` 파일을 열어 실제 값으로 채워주세요.

### 2. 서버 의존성 설치 및 실행

```bash
cd server
npm install
node index.js
```

### 3. 클라이언트 빌드

```bash
cd client
npm install
npm run build
```

빌드 결과물(`client/dist/`)을 S3 버킷에 업로드하거나,  
서버가 `client/dist/`를 정적 파일로 서빙합니다.

### 4. 브라우저에서 접속

```
http://localhost:3000        # 서버 직접 서빙 시
http://your-s3-bucket-url   # S3 배포 시
```

---

## 주요 기능

- **오늘의 명언**: 페이지 로드 시 오늘 날짜 기준 자동 조회, 날짜 선택 가능
- **히스토리**: 지금까지 조회된 모든 명언 목록 표시
- **캐싱**: 한 번 조회한 날짜는 SQLite에 저장되어 AI API 재호출 없이 즉시 반환
- **반응형**: 모바일 / 데스크톱 모두 대응

---

## API 명세

### `GET /api/quote?date=MM-DD`

날짜별 인물 명언 조회 (없으면 AI 생성 후 캐싱)

### `GET /api/quote/history`

저장된 전체 명언 목록 반환 (날짜 오름차순)

**응답 예시 (`/api/quote`)**

```json
{
  "source": "ai",
  "data": {
    "id": 1,
    "date_key": "04-11",
    "person_name": "찰리 채플린",
    "birth_year": "1889",
    "death_year": "1977",
    "nationality": "영국",
    "bio": "...",
    "quote_original": "Life is a tragedy when seen in close-up, but a comedy in long-shot.",
    "quote_korean": "인생은 가까이서 보면 비극이지만, 멀리서 보면 희극이다.",
    "connection_type": "birthday",
    "connection_desc": "찰리 채플린은 1889년 4월 16일에 태어났습니다.",
    "created_at": "2025-04-11 09:00:00"
  }
}
```

`source` 필드: `"cache"` (DB 캐시) 또는 `"ai"` (AI 신규 생성)
