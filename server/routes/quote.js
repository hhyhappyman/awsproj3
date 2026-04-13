// /api/quote 라우터 - 날짜별 인물 명언 조회 및 AI 생성 캐싱
const express = require('express');
const router = express.Router();
const { getByDateKey, insertQuote, getAllQuotes } = require('../db');
const { fetchQuoteFromAI } = require('../ai');

/** GET /api/quote/history — 저장된 전체 명언 목록 반환 */
router.get('/history', (req, res) => {
  try {
    const list = getAllQuotes();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

/**
 * GET /api/quote?date=MM-DD
 *
 * 1. DB에 해당 날짜 데이터가 있으면 즉시 반환
 * 2. 없으면 Claude AI API를 호출하여 데이터 생성 후 DB에 저장하고 반환
 */
router.get('/', async (req, res) => {
  try {
    const { date } = req.query;

    // date 파라미터 유효성 검사 (MM-DD 형식)
    if (!date || !/^\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: 'date 파라미터가 필요합니다. 형식: MM-DD (예: 04-11)',
      });
    }

    // DB 캐시 조회
    const cached = getByDateKey(date);
    if (cached) {
      console.log(`[캐시 HIT] ${date} 데이터를 DB에서 반환합니다.`);
      return res.json({ source: 'cache', data: cached });
    }

    // DB에 없으면 AI API 호출
    console.log(`[캐시 MISS] ${date} — Claude AI API를 호출합니다...`);
    const aiData = await fetchQuoteFromAI(date);

    // AI 응답을 DB에 저장 (캐싱)
    insertQuote(aiData);
    console.log(`[저장 완료] ${date} 데이터를 DB에 캐시했습니다.`);

    // 방금 저장한 데이터를 DB에서 다시 읽어 응답 (id, created_at 포함)
    const saved = getByDateKey(date);
    return res.json({ source: 'ai', data: saved || aiData });
  } catch (err) {
    console.error('[에러]', err.message);
    return res.status(500).json({
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

module.exports = router;
