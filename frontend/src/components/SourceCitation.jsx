import { ExternalLink } from 'lucide-react'
import PropTypes from 'prop-types'

export default function SourceCitation({ label, url }) {
  return (
    <a className="citation" href={url} target="_blank" rel="noreferrer">
      <span>{label}</span>
      <ExternalLink size={12} />
    </a>
  )
}

SourceCitation.propTypes = {
  label: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
}
