'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, X, BookOpen } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'
import {
  fmt,
  matchesQuery,
  categoryColor,
  evidenceColor,
  fdaColor,
} from '@/lib/peptide-format'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'

export default function PeptideList({ peptides }) {
  const [query, setQuery] = useState('')
  // The list is filtered on the debounced value but the input stays fully
  // responsive, so typing never waits on a re-render of every card.
  const debounced = useDebounce(query, 180)

  const filtered = useMemo(
    () => peptides.filter((p) => matchesQuery(p, debounced)),
    [peptides, debounced]
  )

  return (
    <div>
      <div className="relative mb-4">
        <Search
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-tx3-body"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, category, tag…"
          aria-label="Search peptides"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className="w-full rounded-[10px] border border-hairline bg-surface py-3 pr-11 pl-10 text-[15px] text-tx placeholder:text-tx3-body"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="tap absolute top-1/2 right-1 flex -translate-y-1/2 items-center justify-center text-tx3-body hover:text-tx"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <p aria-live="polite" className="sr-only">
        {filtered.length} of {peptides.length} peptides shown
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No matches"
          body={`Nothing matches “${debounced}”. Try a different name, category or tag.`}
          action={{ label: 'Clear search', onClick: () => setQuery('') }}
        />
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link
                href={`/app/encyclopedia/${p.id}`}
                className="card flex h-full flex-col p-4 no-underline transition-colors hover:border-hairline-strong"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="text-base font-bold text-tx">{p.name}</span>
                  <Badge label={fmt(p.fda_status)} color={fdaColor(p.fda_status)} />
                </div>

                <div className="mb-2.5 flex flex-wrap gap-1">
                  <Badge label={fmt(p.category)} color={categoryColor(p.category)} />
                  <Badge
                    label={fmt(p.evidence_level)}
                    color={evidenceColor(p.evidence_level)}
                  />
                  {p.data_completeness !== 'complete' && (
                    <Badge
                      label={fmt(p.data_completeness)}
                      color="#6b7788"
                      title="How complete this entry is"
                    />
                  )}
                </div>

                <p className="line-clamp-2 text-[13px] leading-5 text-tx2">
                  {p.summary}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
