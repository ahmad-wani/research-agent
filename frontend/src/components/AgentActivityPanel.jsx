import { CheckCircle2, CircleDashed, FileText, ListTodo, SearchCheck, ShieldCheck } from 'lucide-react'
import PropTypes from 'prop-types'

const icons = {
  planner: ListTodo,
  worker: SearchCheck,
  verifier: ShieldCheck,
  synthesizer: FileText,
  complete: CheckCircle2,
  queued: CircleDashed,
}

export default function AgentActivityPanel({ events, loading }) {
  if (!events.length) {
    return <p className="empty-state">No activity yet.</p>
  }

  return (
    <ol className="activity-list">
      {events.map((event, index) => (
        <li key={`${event.stage}-${index}`}>
          <div className={`activity-icon ${index === events.length - 1 && loading ? 'pulse' : ''}`}>
            {(() => {
              const Icon = icons[event.stage] || CircleDashed
              return <Icon size={16} />
            })()}
          </div>
          <div>
            <div className="activity-stage">{event.title || event.stage}</div>
            <p>{event.detail || 'Step completed.'}</p>
            {event.errors?.length > 0 && <span className="activity-warning">{event.errors.length} run note(s)</span>}
          </div>
        </li>
      ))}
    </ol>
  )
}

AgentActivityPanel.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      stage: PropTypes.string.isRequired,
      title: PropTypes.string,
      detail: PropTypes.string,
      errors: PropTypes.array,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
}
