import { Check, Circle, Loader2 } from 'lucide-react'
import PropTypes from 'prop-types'

export default function TaskChecklist({ tasks, loading, completed }) {
  if (!tasks.length) {
    return <p className="empty-state">Tasks will appear after planning.</p>
  }

  return (
    <ul className="task-list">
      {tasks.map((task, index) => {
        const isDone = index < completed
        const isActive = loading && !isDone && index === completed
        const Icon = isDone ? Check : isActive ? Loader2 : Circle

        return (
          <li key={`${task}-${index}`} className={isDone ? 'is-done' : isActive ? 'is-active' : ''}>
            <Icon size={16} />
            <span>{task}</span>
          </li>
        )
      })}
    </ul>
  )
}

TaskChecklist.propTypes = {
  tasks: PropTypes.arrayOf(PropTypes.string).isRequired,
  loading: PropTypes.bool.isRequired,
  completed: PropTypes.number.isRequired,
}
