/**
 * Label/value pair inside a detail section.
 *
 * Booleans render as Yes/No and a numeric 0 is a real value — native writes
 * `value={p.clinical_trials_count || null}`, which hides a genuine zero and
 * makes "0 clinical trials" indistinguishable from "unknown".
 */
export default function Row({ label, value }) {
  if (value === null || value === undefined || value === '') return null

  const display =
    value === true ? 'Yes' : value === false ? 'No' : String(value)

  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-[13px] text-tx2">{label}</dt>
      <dd className="text-right text-[13px] font-semibold text-tx">{display}</dd>
    </div>
  )
}

export function Divider() {
  return <hr className="my-3 border-0 border-t border-hairline" />
}

export function Subheading({ children }) {
  return (
    <h3 className="mt-1 mb-2 text-[13px] font-bold text-tx">{children}</h3>
  )
}

export function Body({ children, className = '' }) {
  if (!children) return null
  return (
    <p className={`text-sm leading-6 text-tx2 ${className}`}>{children}</p>
  )
}
