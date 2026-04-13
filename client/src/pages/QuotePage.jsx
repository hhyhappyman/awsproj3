import { useState, useEffect } from 'react'
import { fetchQuote } from '../api'
import QuoteCard from '../components/QuoteCard'

function toDateKey(date) {
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${mm}-${dd}`
}

function toInputValue(date) {
  return date.toISOString().slice(0, 10)
}

function formatKorean(dateKey) {
  const [mm, dd] = dateKey.split('-')
  return `${parseInt(mm)}월 ${parseInt(dd)}일`
}

export default function QuotePage() {
  const [dateKey, setDateKey] = useState(toDateKey(new Date()))
  const [state, setState] = useState({ status: 'loading', data: null, source: null, error: null })

  useEffect(() => {
    setState({ status: 'loading', data: null, source: null, error: null })
    fetchQuote(dateKey)
      .then(({ source, data }) => setState({ status: 'ok', data, source, error: null }))
      .catch(err => setState({ status: 'error', data: null, source: null, error: err.message }))
  }, [dateKey])

  return (
    <>
      <div className="date-bar">
        <span className="date-bar__text">{formatKorean(dateKey)}</span>
        <input
          type="date"
          className="date-bar__input"
          defaultValue={toInputValue(new Date())}
          onChange={e => {
            if (!e.target.value) return
            const [, mm, dd] = e.target.value.split('-')
            setDateKey(`${mm}-${dd}`)
          }}
        />
      </div>

      {state.status === 'loading' && (
        <div className="state state--loading">
          <div className="spinner" />
          <p className="state__message">인물 정보를 불러오는 중입니다…</p>
        </div>
      )}

      {state.status === 'error' && (
        <div className="state state--error">
          <div className="state__icon">⚠️</div>
          <p className="state__message">{state.error}</p>
          <button className="btn btn--retry" onClick={() => setDateKey(k => k)}>다시 시도</button>
        </div>
      )}

      {state.status === 'ok' && <QuoteCard data={state.data} source={state.source} />}
    </>
  )
}
