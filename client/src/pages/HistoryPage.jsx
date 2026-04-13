import { useState, useEffect } from 'react'
import { fetchHistory } from '../api'

const badgeMap = {
  birthday:         { label: '🎂 생일',       cls: 'card__badge--birthday' },
  deathday:         { label: '🕯️ 기일',       cls: 'card__badge--deathday' },
  historical_event: { label: '📜 역사적 사건', cls: 'card__badge--historical_event' },
}

export default function HistoryPage() {
  const [list, setList] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
      .then(data => { setList(data); setStatus('ok') })
      .catch(err => { setError(err.message); setStatus('error') })
  }, [])

  if (status === 'loading') return (
    <div className="state state--loading">
      <div className="spinner" />
      <p className="state__message">히스토리를 불러오는 중입니다…</p>
    </div>
  )

  if (status === 'error') return (
    <div className="state state--error">
      <div className="state__icon">⚠️</div>
      <p className="state__message">{error}</p>
    </div>
  )

  if (list.length === 0) return (
    <div className="state">
      <p className="state__message">저장된 명언이 없습니다.</p>
    </div>
  )

  return (
    <div className="history-list">
      {list.map(item => {
        const badge = badgeMap[item.connection_type] ?? { label: item.connection_type, cls: 'card__badge--historical_event' }
        return (
          <div key={item.id} className="history-item">
            <span className="history-item__date">{item.date_key}</span>
            <div className="history-item__body">
              <strong className="history-item__name">{item.person_name}</strong>
              <p className="history-item__quote">{item.quote_korean}</p>
              <span className={`card__badge history-item__badge ${badge.cls}`}>{badge.label}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
