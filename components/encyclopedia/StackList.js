'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, X, Layers } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { fmt, matchesStackQuery, categoryColor, evidenceColor, stackTypeColor } from '@/lib/peptide-format'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'

export default function StackList({ stacks }) {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 180)

  const filtered = useMemo(
    () => stacks.filter((st) => matchesStackQuery(st, debounced)),
    [stacks, debounced]
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
          placeholder="Search by name, category…"
          aria-label="Search stacks"
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
        {filtered.length} of {stacks.length} stacks shown
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No matches"
          body={`Nothing matches “${debounced}”. Try a different name or category.`}
          action={{ label: 'Clear search', onClick: () => setQuery('') }}
        />
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((st) => (
            <li key={st.id}>
              <Link
                href={`/app/encyclopedia/stacks/${st.id}`}
                className="card flex h-full flex-col p-4 no-underline transition-colors hover:border-hairline-strong"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="text-base font-bold text-tx">{st.name}</span>
                  <Badge label={fmt(st.stack_type)} color={stackTypeColor(st.stack_type)} />
                </div>

                <div className="mb-2.5 flex flex-wrap gap-1">
                  {st.category && (
                    <Badge label={fmt(st.category)} color={categoryColor(st.category)} />
                  )}
                  <Badge label={fmt(st.evidence_level)} color={evidenceColor(st.evidence_level)} />
                  {st.data_completeness !== 'complete' && (
                    <Badge
                      label={fmt(st.data_completeness)}
                      color="#6b7788"
                      title="How complete this entry is"
                    />
                  )}
                </div>

                <p className="line-clamp-2 text-[13px] leading-5 text-tx2">
                  {st.positioning}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
