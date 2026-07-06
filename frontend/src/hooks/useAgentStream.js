import { useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

function parseSse(buffer, onEvent) {
  const chunks = buffer.split('\n\n')
  const remainder = chunks.pop() || ''
  for (const chunk of chunks) {
    const eventLine = chunk.split('\n').find((line) => line.startsWith('event: '))
    const dataLine = chunk.split('\n').find((line) => line.startsWith('data: '))
    if (!eventLine || !dataLine) continue
    onEvent(eventLine.slice(7), JSON.parse(dataLine.slice(6)))
  }
  return remainder
}

export function useAgentStream() {
  const [events, setEvents] = useState([])
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const runResearch = async (query) => {
    setEvents([])
    setReport('')
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/research/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      if (!response.ok || !response.body) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        buffer = parseSse(buffer, (stage, payload) => {
          setEvents((current) => [...current, { stage, payload }])
          const nextReport = payload?.state?.report
          if (nextReport) setReport(nextReport)
          if (stage === 'error') setError(payload.message || 'Research failed.')
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed.')
    } finally {
      setLoading(false)
    }
  }

  return { events, report, loading, error, runResearch }
}
