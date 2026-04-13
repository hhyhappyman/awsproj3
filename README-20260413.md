# 오늘의 인물 명언

오늘 날짜에 태어났거나 사망한 유명 인물의 명언과 소개를 보여주는 웹 애플리케이션입니다.  
해당 날짜에 관련 인물이 없으면 그날 발생한 중요한 역사적 사건과 연관된 인물을 대신 표시합니다.

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| 클라이언트 | Vanilla JS, HTML5, CSS3 |
| 서버 | Node.js + Express.js |
| 데이터베이스 | SQLite (better-sqlite3) |
| AI API | Anthropic Claude (claude-sonnet-4-20250514) |

---

## 프로젝트 구조

```
project-root/
├── client/
│   ├── index.html      # 메인 HTML
│   ├── style.css       # 스타일시트
│   └── app.js          # 클라이언트 로직
├── server/
│   ├── index.js        # Express 서버 진입점
│   ├── db.js           # SQLite 초기화 및 쿼리
│   ├── ai.js           # Claude AI API 호출 모듈
│   └── routes/
│       └── quote.js    # GET /api/quote 라우터
├── .env.example        # 환경변수 예시
├── .gitignore
└── README.md
```

---

## 실행 방법

### 1. 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 Anthropic API 키를 입력합니다.

```bash
cp .env.example .env
```

`.env` 파일을 열어 API 키를 실제 값으로 교체합니다.

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
PORT=3000
DB_PATH=./server/database.sqlite
```

> API 키는 [Anthropic Console](https://console.anthropic.com)에서 발급받을 수 있습니다.

### 2. 의존성 설치

```bash
cd server
npm install
```

### 3. 서버 실행

```bash
node index.js
```

또는 파일 변경 감지 모드로 실행 (Node.js 18+):

```bash
npm run dev
```

### 4. 브라우저에서 접속

서버가 실행되면 아래 주소로 접속합니다:

```
http://localhost:3000
```

---

## 주요 기능

- **오늘의 인물**: 페이지 로드 시 오늘 날짜 기준으로 자동 조회
- **날짜 선택**: 📅 버튼 클릭 → 달력 UI → 날짜 변경 시 자동 갱신
- **캐싱**: 한 번 조회한 날짜는 SQLite에 저장되어 AI API 재호출 없이 즉시 반환
- **반응형**: 모바일 / 데스크톱 모두 대응

## API 명세

### `GET /api/quote?date=MM-DD`

| 파라미터 | 설명 | 예시 |
|---------|------|------|
| `date`  | MM-DD 형식 날짜 | `04-11` |

**응답 예시**

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
