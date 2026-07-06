import PropTypes from 'prop-types'

export default function AgentActivityPanel({ events }) {
  if (!events.length) {
    return <p className="empty-state">No activity yet.</p>
  }

  return (
    <ol className="activity-list">
      {events.map((event, index) => (
        <li key={`${event.stage}-${index}`}>
          <div className="activity-stage">{event.stage}</div>
          <pre>{JSON.stringify(event.payload, null, 2)}</pre>
        </li>
      ))}
    </ol>
  )
}

AgentActivityPanel.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      stage: PropTypes.string.isRequired,
      payload: PropTypes.object.isRequired,
    }),
  ).isRequired,
}
