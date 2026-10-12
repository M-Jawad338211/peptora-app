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

// The order the category chips are shown in. A category only gets a chip when
// the library has at least one entry in it.
const CATEGORY_ORDER = [
  'metabolic',
  'growth-hormone',
  'healing',
  'cognitive',
  'longevity',
  'immune',
  'sexual-health',
  'cosmetic',
  'other',
]

export default function PeptideList({ peptides }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  // The list is filtered on the debounced value but the input stays fully
  // responsive, so typing never waits on a re-render of every card.
  const debounced = useDebounce(query, 180)

  // Chips for the categories that exist, each with how many entries it holds.
  const categories = useMemo(() => {
    const counts = new Map()
    for (const p of peptides) counts.set(p.category, (counts.get(p.category) || 0) + 1)
    const known = CATEGORY_ORDER.filter((c) => counts.has(c))
    const extra = [...counts.keys()].filter((c) => !CATEGORY_ORDER.includes(c)).sort()
    return [...known, ...extra].map((id) => ({ id, count: counts.get(id) }))
  }, [peptides])

  const filtered = useMemo(
    () =>
      peptides.filter(
        (p) =>
          (category === 'all' || p.category === category) &&
          matchesQuery(p, debounced)
      ),
    [peptides, debounced, category]
  )

  const clearFilters = () => {
    setQuery('')
    setCategory('all')
  }

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
          placeholder="Search by name, category or tag"
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

      {categories.length > 1 && (
        <div
          role="group"
          aria-label="Filter by category"
          className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1 pb-1"
        >
          {[{ id: 'all', count: peptides.length }, ...categories].map((c) => {
            const active = category === c.id
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(c.id)}
                className={`min-h-[36px] shrink-0 rounded-full border px-3 text-[13px] font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? 'border-teal/50 bg-teal/12 text-teal'
                    : 'border-hairline bg-surface text-tx2 hover:border-hairline-strong hover:text-tx'
                }`}
              >
                {c.id === 'all' ? 'All' : fmt(c.id)}
                <span className={`ml-1.5 text-[12px] font-normal ${active ? 'text-teal' : 'text-tx3-body'}`}>
                  {c.count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <p aria-live="polite" className="sr-only">
        {filtered.length} of {peptides.length} peptides shown
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No matches"
          body={
            debounced
              ? `Nothing matches “${debounced}”${category === 'all' ? '' : ` in ${fmt(category)}`}. Try a different name, category or tag.`
              : `There is nothing in ${fmt(category)} yet.`
          }
          action={{ label: 'Clear filters', onClick: clearFilters }}
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
