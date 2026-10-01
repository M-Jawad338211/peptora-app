import { TriangleAlert } from 'lucide-react'

/**
 * Engine notes (amount exceeds the vial, draw over one syringe, draw under 2
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

/**
 * What the calculator and the protocol form are, said once above them.
 * Neutral on purpose: it is a statement of what the tool does, not a warning.
 */
export function ResearchBanner({ children }) {
  return (
    <p className="mb-4 rounded-[10px] border border-hairline bg-white/4 px-3.5 py-3 text-[13px] leading-5 text-tx2">
      {children ??
        'Peptora works on the numbers you enter. It does not recommend doses, and it is not medical advice.'}
    </p>
  )
}
