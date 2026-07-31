/**
 * Convert a dose stored in mcg back to the user's display unit.
 *
 * The API always persists `target_dose_mcg` in micrograms while `unit` is
 * only a display preference. Native renders the two together verbatim
 * (`{target_dose_mcg} {unit}`), so a 5 mg dose — stored as 5000 mcg — shows
 * as "5000 mg". This is the fix for that.
 */
export function formatDoseFromMcg(mcg, unit = 'mcg', iuPerMg = null) {
  // Number(null) and Number('') are both 0, which is finite — so a missing
  // dose would render as a confident "0 mcg" without this guard.
  if (mcg === null || mcg === undefined || mcg === '') return ''
  const value = Number(mcg)
  if (!Number.isFinite(value)) return ''

  if (unit === 'mg') return `${trim(value / 1000)} mg`
  if (unit === 'IU') {
    // Without iu_per_mg the conversion is impossible; show mcg rather than a
    // wrong number in the wrong unit.
    if (!iuPerMg) return `${trim(value)} mcg`
    return `${trim((value / 1000) * iuPerMg)} IU`
  }
  return `${trim(value)} mcg`
}

/** Drop trailing zeros: 5.000 -> "5", 0.250 -> "0.25". */
function trim(n) {
  return String(Number(n.toFixed(4)))
}

const DATE_FMT = { day: 'numeric', month: 'short', year: 'numeric' }
const DATETIME_FMT = { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }

/**
 * Date helpers. Native reimplements formatting in six files with three
 * different outputs and a hardcoded "en-US"; undefined here means the
 * viewer's own locale.
 */
export function formatDate(value) {
  const d = toDate(value)
  return d ? d.toLocaleDateString(undefined, DATE_FMT) : ''
}

export function formatDateTime(value) {
  const d = toDate(value)
  return d ? d.toLocaleString(undefined, DATETIME_FMT) : ''
}

export function daysSince(value) {
  const d = toDate(value)
  if (!d) return null
  return Math.floor((Date.now() - d.getTime()) / 86_400_000)
}

function toDate(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}
