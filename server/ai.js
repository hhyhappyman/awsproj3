// Claude AI API 호출 모듈
const Anthropic = require('@anthropic-ai/sdk');

// Anthropic 클라이언트 초기화 (ANTHROPIC_API_KEY 환경변수 자동 참조)
const client = new Anthropic();

/**
 * 날짜(MM-DD)를 받아 Claude AI에게 관련 인물 및 명언 데이터를 요청한다.
 * @param {string} dateKey - 'MM-DD' 형식 (예: '04-11')
 * @returns {Promise<object>} 파싱된 인물 명언 JSON 객체
 */
async function fetchQuoteFromAI(dateKey) {
  // MM-DD를 "MM월 DD일" 형식으로 변환
  const [month, day] = dateKey.split('-');
  const dateLabel = `${parseInt(month, 10)}월 ${parseInt(day, 10)}일`;

  const prompt = `오늘은 ${dateLabel}입니다.

이 날짜(${dateLabel})에 태어났거나 사망한 세계적으로 유명한 인물 1명을 선정해주세요.
만약 특별히 유명한 인물이 없다면, 이 날짜에 발생한 중요한 역사적 사건과 가장 관련 깊은 인물 1명을 선정해주세요.

반드시 아래 JSON 형식으로만 응답하세요. 마크다운 코드블록(예: \`\`\`json)을 사용하지 말고, 순수 JSON 텍스트만 반환하세요.

{
  "date_key": "${dateKey}",
  "person_name": "인물 전체 이름 (한국어 표기)",
  "birth_year": "출생년도 (숫자 문자열, 예: '1879')",
  "death_year": "사망년도 (생존 인물이면 null)",
  "nationality": "국적 (한국어, 예: '독일', '미국')",
  "bio": "인물 소개 3~5문장. 주요 업적과 역사적 의의를 포함할 것.",
  "quote_original": "이 인물의 가장 유명한 명언 원문 (원어로 작성)",
  "quote_korean": "위 명언의 한국어 번역",
  "connection_type": "birthday 또는 deathday 또는 historical_event 중 하나",
  "connection_desc": "${dateLabel}과 이 인물의 연관 사유를 1~2문장으로 설명"
}`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  // 응답 텍스트 추출
  const rawText = response.content[0].text.trim();

  // 순수 JSON 파싱 시도 (마크다운 코드블록이 포함된 경우 제거)
  const jsonText = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    throw new Error(`AI 응답을 JSON으로 파싱하는 데 실패했습니다: ${err.message}\n원문: ${rawText}`);
  }

  return parsed;
}

module.exports = { fetchQuoteFromAI };
