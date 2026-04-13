export default function QuoteCard({ data, source }) {
  const badgeMap = {
    birthday:         { label: '🎂 생일',       cls: 'card__badge--birthday' },
    deathday:         { label: '🕯️ 기일',       cls: 'card__badge--deathday' },
    historical_event: { label: '📜 역사적 사건', cls: 'card__badge--historical_event' },
  }
  const badge = badgeMap[data.connection_type] ?? { label: data.connection_type, cls: 'card__badge--historical_event' }
  const years = [data.birth_year, data.death_year].filter(Boolean).join(' – ')

  return (
    <article className="card">
      <div className="card__person">
        <h2 className="card__name">{data.person_name}</h2>
        {years && <p className="card__years">({years})</p>}
      </div>
      <hr className="card__divider" />
      <section className="card__section card__section--quote">
        <h3 className="card__section-title">대표 명언</h3>
        <p className="card__quote-korean">{data.quote_korean}</p>
        <blockquote className="card__quote-original">{data.quote_original}</blockquote>
      </section>
      <section className="card__section">
        <h3 className="card__section-title">인물 소개</h3>
        <p className="card__bio">{data.bio}</p>
      </section>
      <section className="card__section">
        <h3 className="card__section-title">이 날과의 인연</h3>
        <p className="card__connection">{data.connection_desc}</p>
      </section>
      <footer className="card__footer">
        <span className={`card__badge ${badge.cls}`}>{badge.label}</span>
      </footer>
    </article>
  )
}
