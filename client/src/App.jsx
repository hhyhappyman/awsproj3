import { useState } from 'react'
import QuotePage from './pages/QuotePage'
import HistoryPage from './pages/HistoryPage'
import './App.css'

export default function App() {
  const [page, setPage] = useState('quote') // 'quote' | 'history'

  return (
    <>
      <header className="header">
        <div className="header__inner">
          <h1 className="header__title">오늘의 인물 명언</h1>
          <nav className="header__nav">
            <button
              className={`nav-btn${page === 'quote' ? ' nav-btn--active' : ''}`}
              onClick={() => setPage('quote')}
            >오늘의 명언</button>
            <button
              className={`nav-btn${page === 'history' ? ' nav-btn--active' : ''}`}
              onClick={() => setPage('history')}
            >히스토리</button>
          </nav>
        </div>
      </header>
      <main className="main">
        {page === 'quote' ? <QuotePage /> : <HistoryPage onSelect={() => setPage('quote')} />}
      </main>
    </>
  )
}
