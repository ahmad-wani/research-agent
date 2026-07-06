import PropTypes from 'prop-types'
import SourceCitation from './SourceCitation.jsx'

const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g

function renderMarkdownish(report) {
  const lines = report.split('\n')
  return lines.map((line, index) => {
    if (line.startsWith('# ')) return <h1 key={index}>{line.slice(2)}</h1>
    if (line.startsWith('## ')) return <h2 key={index}>{line.slice(3)}</h2>
    if (line.startsWith('- ')) return <li key={index}>{renderLinks(line.slice(2), index)}</li>
    if (!line.trim()) return <br key={index} />
    return <p key={index}>{renderLinks(line, index)}</p>
  })
}

function renderLinks(text, keyPrefix) {
  const parts = []
  let lastIndex = 0
  let match
  while ((match = linkPattern.exec(text)) !== null) {
    parts.push(text.slice(lastIndex, match.index))
    parts.push(<SourceCitation key={`${keyPrefix}-${match.index}`} label={match[1]} url={match[2]} />)
    lastIndex = match.index + match[0].length
  }
  parts.push(text.slice(lastIndex))
  return parts
}

export default function ReportView({ report }) {
  if (!report) {
    return <p className="empty-state">The final report will appear here.</p>
  }
  return <article className="report-body">{renderMarkdownish(report)}</article>
}

ReportView.propTypes = {
  report: PropTypes.string.isRequired,
}
