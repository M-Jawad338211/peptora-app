import { fmt, evidenceColor } from '@/lib/peptide-format'

/**
 * Benefits / risks / side effects / contraindications / interactions.
 * All share the {label, detail, evidenceLevel, severity, frequency} shape.
 *
 * Note the JSONB blobs use camelCase keys, unlike every column-level field.
 */
export default function ClaimList({ items }) {
  if (!items?.length) {
    return <p className="text-sm text-tx3-body">None documented.</p>
  }

  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={`${item.label}-${i}`}
          className={i > 0 ? 'border-t border-hairline pt-3' : undefined}
        >
          <p className="text-sm font-semibold text-tx">{item.label}</p>
          {item.detail && (
            <p className="mt-1 text-[13px] leading-5 text-tx3-body">
              {item.detail}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px]">
            {item.evidenceLevel && (
              <span style={{ color: evidenceColor(item.evidenceLevel) }}>
                Evidence: {fmt(item.evidenceLevel)}
              </span>
            )}
            {item.severity && (
              <span className="text-tx3-body">Severity: {fmt(item.severity)}</span>
            )}
            {item.frequency && (
              <span className="text-tx3-body">
                Frequency: {fmt(item.frequency)}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
