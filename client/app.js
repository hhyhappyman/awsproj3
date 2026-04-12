// 클라이언트 진입점 — API 연동 및 동적 렌더링
'use strict';

// ── DOM 참조 ───────────────────────────────────────────────
const displayDate    = document.getElementById('displayDate');
const calendarBtn    = document.getElementById('calendarBtn');
const datePicker     = document.getElementById('datePicker');
const loadingState   = document.getElementById('loadingState');
const errorState     = document.getElementById('errorState');
const errorMessage   = document.getElementById('errorMessage');
const retryBtn       = document.getElementById('retryBtn');
const quoteCard      = document.getElementById('quoteCard');

// 카드 내부 요소
const connectionBadge  = document.getElementById('connectionBadge');
const personName       = document.getElementById('personName');
const personYears      = document.getElementById('personYears');
const personNationality = document.getElementById('personNationality');
const personBio        = document.getElementById('personBio');
const quoteOriginal    = document.getElementById('quoteOriginal');
const quoteKorean      = document.getElementById('quoteKorean');
const connectionDesc   = document.getElementById('connectionDesc');
const dataSource       = document.getElementById('dataSource');

// ── 유틸 함수 ─────────────────────────────────────────────

/**
 * Date 객체를 'MM-DD' 형식 문자열로 변환한다.
 * @param {Date} date
 * @returns {string}
 */
function toDateKey(date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${mm}-${dd}`;
}

/**
 * Date 객체를 'YYYY-MM-DD' 형식 문자열로 변환한다. (input[type=date] 용)
 * @param {Date} date
 * @returns {string}
 */
function toInputValue(date) {
  const yyyy = date.getFullYear();
  const mm   = String(date.getMonth() + 1).padStart(2, '0');
  const dd   = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 'MM-DD' 문자열을 'M월 D일' 형태의 한국어 날짜 문자열로 변환한다.
 * @param {string} dateKey - 'MM-DD'
 * @returns {string}
 */
function formatKoreanDate(dateKey) {
  const [mm, dd] = dateKey.split('-');
  return `${parseInt(mm, 10)}월 ${parseInt(dd, 10)}일`;
}

// ── UI 상태 전환 ───────────────────────────────────────────

/** 로딩 스피너만 표시 */
function showLoading() {
  loadingState.hidden  = false;
  errorState.hidden    = true;
  quoteCard.hidden     = true;
}

/** 에러 메시지를 표시한다. */
function showError(msg) {
  loadingState.hidden  = true;
  errorState.hidden    = false;
  quoteCard.hidden     = true;
  errorMessage.textContent = msg;
}

/** 카드 영역만 표시 */
function showCard() {
  loadingState.hidden  = true;
  errorState.hidden    = true;
  quoteCard.hidden     = false;
}

// ── 카드 렌더링 ───────────────────────────────────────────

/**
 * connection_type 값에 따라 뱃지 텍스트와 CSS 클래스를 반환한다.
 * @param {string} type
 * @returns {{ label: string, cls: string }}
 */
function getBadgeInfo(type) {
  switch (type) {
    case 'birthday':         return { label: '🎂 생일', cls: 'card__badge--birthday' };
    case 'deathday':         return { label: '🕯️ 기일', cls: 'card__badge--deathday' };
    case 'historical_event': return { label: '📜 역사적 사건', cls: 'card__badge--historical_event' };
    default:                 return { label: type, cls: 'card__badge--historical_event' };
  }
}

/**
 * API 응답 데이터로 카드를 채우고 화면에 표시한다.
 * @param {object} data - DB row 또는 AI 파싱 결과
 * @param {string} source - 'cache' | 'ai'
 */
function renderCard(data, source) {
  // 뱃지
  const { label, cls } = getBadgeInfo(data.connection_type);
  connectionBadge.textContent = label;
  connectionBadge.className   = `card__badge ${cls}`;

  // 인물 기본 정보
  personName.textContent = data.person_name || '—';

  const yearParts = [data.birth_year, data.death_year].filter(Boolean);
  personYears.textContent = yearParts.length
    ? `(${yearParts.join(' – ')})`
    : '';

  personNationality.textContent = data.nationality ? `🌏 ${data.nationality}` : '';

  // 소개 / 명언 / 연관 사유
  personBio.textContent      = data.bio            || '';
  quoteOriginal.textContent  = data.quote_original || '';
  quoteKorean.textContent    = data.quote_korean   || '';
  connectionDesc.textContent = data.connection_desc || '';

  // 데이터 출처 표시
  dataSource.textContent = source === 'cache'
    ? '📦 캐시에서 불러온 데이터'
    : '✨ Claude AI가 방금 생성한 데이터';

  showCard();
}

// ── API 호출 ──────────────────────────────────────────────

/** 현재 선택된 날짜를 보관 (MM-DD) */
let currentDateKey = toDateKey(new Date());

/**
 * 서버에 날짜별 명언 데이터를 요청하고 렌더링한다.
 * @param {string} dateKey - 'MM-DD'
 */
async function loadQuote(dateKey) {
  currentDateKey = dateKey;

  // 헤더 날짜 텍스트 갱신
  displayDate.textContent = formatKoreanDate(dateKey);

  showLoading();

  try {
    const res = await fetch(`/api/quote?date=${dateKey}`);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `서버 오류 (${res.status})`);
    }

    const { source, data } = await res.json();
    renderCard(data, source);
  } catch (err) {
    console.error('[요청 실패]', err);
    showError(err.message || '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
}

// ── 이벤트 리스너 ─────────────────────────────────────────

// 달력 아이콘 클릭 → date picker 열기
calendarBtn.addEventListener('click', () => {
  // pointer-events 일시 허용 후 클릭 트리거
  datePicker.style.pointerEvents = 'auto';
  datePicker.style.opacity       = '1';
  datePicker.style.width         = 'auto';
  datePicker.style.height        = 'auto';
  datePicker.showPicker?.();   // 최신 브라우저에서 피커 강제 표시
  datePicker.click();
});

// 날짜 변경 시 API 재요청
datePicker.addEventListener('change', (e) => {
  // 피커 다시 숨김
  datePicker.style.pointerEvents = 'none';
  datePicker.style.opacity       = '0';
  datePicker.style.width         = '0';
  datePicker.style.height        = '0';

  if (!e.target.value) return;

  // YYYY-MM-DD → MM-DD 추출
  const parts   = e.target.value.split('-');
  const dateKey = `${parts[1]}-${parts[2]}`;
  loadQuote(dateKey);
});

// 에러 화면의 "다시 시도" 버튼
retryBtn.addEventListener('click', () => {
  loadQuote(currentDateKey);
});

// ── 초기 실행 ─────────────────────────────────────────────

// date picker 기본값을 오늘 날짜로 설정
datePicker.value = toInputValue(new Date());

// 페이지 로드 시 오늘 날짜로 데이터 요청
loadQuote(toDateKey(new Date()));
