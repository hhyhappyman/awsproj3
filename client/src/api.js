const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export async function fetchQuote(dateKey) {
  const res = await fetch(`${API_BASE_URL}/api/quote?date=${dateKey}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `서버 오류 (${res.status})`)
  }
  return res.json()
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE_URL}/api/quote/history`)
  if (!res.ok) throw new Error(`서버 오류 (${res.status})`)
  return res.json()
}
