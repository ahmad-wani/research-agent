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
  const [tasks, setTasks] = useState([])
  const [sources, setSources] = useState([])
  const [taskProgress, setTaskProgress] = useState(0)
  const [metrics, setMetrics] = useState({ findings: 0, sources: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const runResearch = async (query) => {
    setEvents([])
    setReport('')
    setTasks([])
    setSources([])
    setTaskProgress(0)
    setMetrics({ findings: 0, sources: 0 })
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
        buffer = parseSse(buffer, (eventName, payload) => {
          setEvents((current) => [...current, { eventName, ...payload }])
          if (Array.isArray(payload.tasks)) setTasks(payload.tasks)
          if (typeof payload.current_task_index === 'number') {
            setTaskProgress(payload.current_task_index)
          }
          if (Array.isArray(payload.sources)) {
            setSources(payload.sources)
            setMetrics((current) => ({ ...current, sources: payload.sources.length }))
          }
          if (typeof payload.findings_count === 'number') {
            setMetrics((current) => ({ ...current, findings: payload.findings_count }))
          }
          const nextReport = payload?.state?.report
          if (nextReport) setReport(nextReport)
          if (eventName === 'error') setError(payload.message || 'Research failed.')
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Research failed.')
    } finally {
      setLoading(false)
    }
  }

  return { events, report, tasks, sources, taskProgress, metrics, loading, error, runResearch }
}
