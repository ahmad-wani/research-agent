import { Search } from 'lucide-react'
import PropTypes from 'prop-types'
import { useState } from 'react'

const examples = [
  'Compare LangGraph and CrewAI for research agents',
  'What are the risks of retrieval augmented generation?',
  'Summarize recent trends in AI coding assistants',
]

export default function QueryInput({ disabled, onSubmit }) {
  const [value, setValue] = useState('')

  const submitQuery = (query) => {
    if (query.length >= 3) onSubmit(query)
  }

  const submit = (event) => {
    event.preventDefault()
    submitQuery(value.trim())
  }

  return (
    <div className="query-block">
      <form className="query-form" onSubmit={submit}>
        <input
          value={value}
          disabled={disabled}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask a broad research question..."
        />
        <button type="submit" disabled={disabled || value.trim().length < 3} aria-label="Start research">
          <Search size={18} />
          <span>Run</span>
        </button>
      </form>
      <div className="example-row" aria-label="Sample research questions">
        {examples.map((example) => (
          <button
            key={example}
            type="button"
            disabled={disabled}
            onClick={() => {
              setValue(example)
              submitQuery(example)
            }}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  )
}

QueryInput.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
