import { ExternalLink } from 'lucide-react'
import PropTypes from 'prop-types'

function hostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export default function SourceList({ sources }) {
  if (!sources.length) {
    return <p className="empty-state">Sources will appear as the agent gathers evidence.</p>
  }

  return (
    <div className="source-list">
      {sources.slice(0, 8).map((source, index) => (
        <a key={source.url} className="source-card" href={source.url} target="_blank" rel="noreferrer">
          <span className="source-index">{index + 1}</span>
          <div>
            <h3>{source.title || 'Untitled source'}</h3>
            <p>{hostname(source.url)}</p>
          </div>
          <ExternalLink size={14} />
        </a>
      ))}
    </div>
  )
}

SourceList.propTypes = {
  sources: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      url: PropTypes.string.isRequired,
      snippet: PropTypes.string,
    }),
  ).isRequired,
}
