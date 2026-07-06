import { Download } from 'lucide-react'
import PropTypes from 'prop-types'

function filenameFromQuery(query) {
  const slug = query
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64)

  return `${slug || 'research-report'}.md`
}

export default function DownloadReportButton({ query, report }) {
  const downloadReport = () => {
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filenameFromQuery(query)
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <button className="download-button" type="button" onClick={downloadReport} disabled={!report}>
      <Download size={16} />
      <span>Download</span>
    </button>
  )
}

DownloadReportButton.propTypes = {
  query: PropTypes.string.isRequired,
  report: PropTypes.string.isRequired,
}
