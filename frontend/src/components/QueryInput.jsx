import { Search } from 'lucide-react'
import PropTypes from 'prop-types'
import { useState } from 'react'

export default function QueryInput({ disabled, onSubmit }) {
  const [value, setValue] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const query = value.trim()
    if (query.length >= 3) onSubmit(query)
  }

  return (
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
  )
}

QueryInput.propTypes = {
  disabled: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
}
