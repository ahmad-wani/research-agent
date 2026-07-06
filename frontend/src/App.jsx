import { useMemo, useState } from 'react'
import { Activity, FileText, Library, ListChecks, Sparkles } from 'lucide-react'
import QueryInput from './components/QueryInput.jsx'
import AgentActivityPanel from './components/AgentActivityPanel.jsx'
import DownloadReportButton from './components/DownloadReportButton.jsx'
import ReportView from './components/ReportView.jsx'
import SourceList from './components/SourceList.jsx'
import TaskChecklist from './components/TaskChecklist.jsx'
import { useAgentStream } from './hooks/useAgentStream.js'

export default function App() {
  const [query, setQuery] = useState('')
  const { events, report, tasks, sources, taskProgress, metrics, loading, error, runResearch } = useAgentStream()
  const latestStage = events.at(-1)?.title || (loading ? 'Starting' : 'Ready')
  const uniqueSources = useMemo(() => {
    const seen = new Set()
    return sources.filter((source) => {
      if (!source.url || seen.has(source.url)) return false
      seen.add(source.url)
      return true
    })
  }, [sources])

  const handleSubmit = (nextQuery) => {
    setQuery(nextQuery)
    runResearch(nextQuery)
  }

  return (
    <main className="app-shell">
      <div className="ambient-grid" aria-hidden="true" />
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Autonomous Research Agent</p>
            <h1>Live research that plans, checks evidence, and cites its trail.</h1>
          </div>
          <div className={`status-pill ${loading ? 'is-running' : ''}`}>
            <Sparkles size={15} />
            <span>{loading ? latestStage : 'Ready'}</span>
          </div>
        </header>

        <QueryInput disabled={loading} onSubmit={handleSubmit} />

        {error && <div className="error-banner">{error}</div>}

        <section className="metric-strip" aria-label="Research run summary">
          <div>
            <span>{tasks.length}</span>
            <p>Tasks</p>
          </div>
          <div>
            <span>{metrics.findings}</span>
            <p>Findings</p>
          </div>
          <div>
            <span>{uniqueSources.length}</span>
            <p>Sources</p>
          </div>
        </section>

        <div className="content-grid">
          <aside className="left-rail">
            <section className="panel">
              <div className="panel-heading">
                <Activity size={18} />
                <h2>Agent Activity</h2>
              </div>
              <AgentActivityPanel events={events} loading={loading} />
            </section>

            <section className="panel">
              <div className="panel-heading">
                <ListChecks size={18} />
                <h2>Research Tasks</h2>
              </div>
              <TaskChecklist tasks={tasks} loading={loading} completed={taskProgress} />
            </section>
          </aside>

          <section className="panel report-panel">
            <div className="panel-heading">
              <div className="panel-title">
                <FileText size={18} />
                <h2>{query ? 'Report' : 'Report Preview'}</h2>
              </div>
              {report && <DownloadReportButton query={query} report={report} />}
            </div>
            <ReportView report={report} />
          </section>

          <section className="panel source-panel">
            <div className="panel-heading">
              <Library size={18} />
              <h2>Sources</h2>
            </div>
            <SourceList sources={uniqueSources} />
          </section>
        </div>
      </section>
    </main>
  )
}
