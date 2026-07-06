import { useState } from 'react'
import { Activity, FileText } from 'lucide-react'
import QueryInput from './components/QueryInput.jsx'
import AgentActivityPanel from './components/AgentActivityPanel.jsx'
import ReportView from './components/ReportView.jsx'
import { useAgentStream } from './hooks/useAgentStream.js'

export default function App() {
  const [query, setQuery] = useState('')
  const { events, report, loading, error, runResearch } = useAgentStream()

  const handleSubmit = (nextQuery) => {
    setQuery(nextQuery)
    runResearch(nextQuery)
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Autonomous Research Agent</p>
            <h1>Research with live planning, verification, and citations.</h1>
          </div>
          <div className="status-pill">{loading ? 'Running' : 'Ready'}</div>
        </header>

        <QueryInput disabled={loading} onSubmit={handleSubmit} />

        {error && <div className="error-banner">{error}</div>}

        <div className="content-grid">
          <section className="panel">
            <div className="panel-heading">
              <Activity size={18} />
              <h2>Agent Activity</h2>
            </div>
            <AgentActivityPanel events={events} />
          </section>

          <section className="panel report-panel">
            <div className="panel-heading">
              <FileText size={18} />
              <h2>{query ? 'Report' : 'Report Preview'}</h2>
            </div>
            <ReportView report={report} />
          </section>
        </div>
      </section>
    </main>
  )
}
