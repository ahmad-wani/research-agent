import PropTypes from 'prop-types'
import SourceCitation from './SourceCitation.jsx'

const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g

function renderMarkdownish(report) {
  const lines = report.split('\n')
  const blocks = []
  let bulletItems = []

  const flushBullets = () => {
    if (!bulletItems.length) return
    blocks.push(
      <ul key={`list-${blocks.length}`} className="report-list">
        {bulletItems}
      </ul>,
    )
    bulletItems = []
  }

  lines.forEach((line, index) => {
    if (line.startsWith('# ')) {
      flushBullets()
      blocks.push(<h1 key={index}>{line.slice(2)}</h1>)
      return
    }
    if (line.startsWith('## ')) {
      flushBullets()
      blocks.push(<h2 key={index}>{line.slice(3)}</h2>)
      return
    }
    if (line.startsWith('### ')) {
      flushBullets()
      blocks.push(<h3 key={index}>{line.slice(4)}</h3>)
      return
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      bulletItems.push(<li key={index}>{renderLinks(line.slice(2), index)}</li>)
      return
    }
    flushBullets()
    if (!line.trim()) {
      return
    }
    blocks.push(<p key={index}>{renderLinks(line, index)}</p>)
  })

  flushBullets()
  return blocks
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
