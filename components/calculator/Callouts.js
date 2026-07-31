import { TriangleAlert } from 'lucide-react'

/**
 * Engine warnings (dose exceeds vial, draw over one syringe, draw under 2
 * units). role="status" so they are announced as results update.
 */
export function WarningsCallout({ warnings }) {
  if (!warnings?.length) return null

  return (
    <div
      role="status"
      className="mt-4 rounded-[10px] border border-warn/25 bg-warn/7 p-3.5"
    >
      <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-[0.5px] text-warn uppercase">
        <TriangleAlert size={13} aria-hidden="true" />
        Notes
      </p>
      <ul className="space-y-1">
        {warnings.map((w) => (
          <li key={w} className="text-[13px] leading-5 text-warn">
            {w}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Reported dosing frequency for the selected peptide, with its framing. */
export function FrequencyNote({ frequency }) {
  if (!frequency) return null

  return (
    <div className="mt-4 rounded-[10px] bg-white/3 p-3.5">
      <p className="eyebrow mb-1 text-[10px]">Reported frequency</p>
      <p className="text-sm text-tx">{frequency}</p>
      <p className="mt-1 text-[12px] text-tx3-body italic">
        Studied / reported range — not a recommendation.
      </p>
    </div>
  )
}

/** Persistent research-use disclaimer shown above the calculator. */
export function ResearchBanner() {
  return (
    <p className="mb-4 rounded-[10px] border border-danger/20 bg-danger/8 px-3.5 py-3 text-[13px] leading-5 text-danger-soft">
      For research and educational use only — not medical advice.
    </p>
  )
}
