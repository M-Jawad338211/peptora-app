import { referenceHref } from '@/lib/peptide-format'

/**
 * The numbered markers after a statement. Each one opens the source it was
 * written from: the link stored with the reference, its DOI or its PubMed
 * record. A reference with no link is still shown, dimmed, so the numbering
 * matches the Sources list below.
 */
export default function Cites({ ids, references }) {
  const found = (ids ?? [])
    .map((id) => (references ?? []).find((r) => r.ref_id === id))
    .filter(Boolean)
  if (found.length === 0) return null

  const chip =
    'flex size-6 items-center justify-center rounded-full border border-teal/35 bg-teal/10 font-mono text-[11px] font-bold text-teal no-underline'

  return (
    <p className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-bold tracking-[0.5px] text-tx3-body uppercase">
      {found.length === 1 ? 'Source' : 'Sources'}
      {found.map((ref) => {
        const href = referenceHref(ref)
        return href ? (
          <a
            key={ref.ref_id}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Source ${ref.ref_id}: ${ref.title}`}
            className={`${chip} hover:bg-teal/20`}
          >
            {ref.ref_id}
          </a>
        ) : (
          <span key={ref.ref_id} className={`${chip} opacity-50`}>
            {ref.ref_id}
          </span>
        )
      })}
    </p>
  )
}
