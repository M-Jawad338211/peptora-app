/**
 * Presentation helpers for peptide data.
 *
 * The API returns kebab-case enum values ("early-human", "growth-hormone");
 * these turn them into display text and colours. Colour values are ported
 * verbatim from peptora-android/app/(tabs)/encyclopedia.js:158-184.
 */

/** "early-human" -> "Early Human" */
export function fmt(str) {
  if (!str) return ''
  return String(str)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export const EVIDENCE_COLOR = {
  established: '#00d68f',
  'early-human': '#4a9eff',
  preclinical: '#ffd32a',
  anecdotal: '#a78bfa',
  unknown: '#6b7788',
}

export const FDA_COLOR = {
  approved: '#00d68f',
  investigational: '#ffd32a',
  'not-approved': '#ff4757',
  withdrawn: '#ff4757',
  unknown: '#6b7788',
}

export const CATEGORY_COLOR = {
  healing: '#34d399',
  'growth-hormone': '#60a5fa',
  metabolic: '#f59e0b',
  cognitive: '#a78bfa',
  cosmetic: '#f472b6',
  longevity: '#2dd4bf',
  immune: '#fb923c',
  'sexual-health': '#e879f9',
  other: '#6b7788',
}

export const evidenceColor = (v) => EVIDENCE_COLOR[v] || '#6b7788'
export const fdaColor = (v) => FDA_COLOR[v] || '#6b7788'
export const categoryColor = (v) => CATEGORY_COLOR[v] || '#6b7788'

/**
 * Match a peptide against a free-text query across the fields the native
 * search covers: name, category, aliases and tags.
 */
export function matchesQuery(peptide, query) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  const haystack = [
    peptide.name,
    peptide.category,
    ...(peptide.aliases || []),
    ...(peptide.tags || []),
  ]
  return haystack.some((v) => v && String(v).toLowerCase().includes(q))
}

/** Render a studied dose range as "250–500 mcg" or "250 mcg". */
export function formatDoseRange(dr) {
  if (dr.low == null && dr.high == null) return null
  if (dr.low != null && dr.high != null && dr.low !== dr.high) {
    return `${dr.low}–${dr.high} ${dr.unit}`
  }
  return `${dr.low ?? dr.high} ${dr.unit}`
}

/** Build a resolvable link for a reference, preferring DOI over PubMed. */
export function referenceHref(ref) {
  if (ref.url) return ref.url
  if (ref.doi) return `https://doi.org/${ref.doi}`
  if (ref.pmid) return `https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`
  return null
}
