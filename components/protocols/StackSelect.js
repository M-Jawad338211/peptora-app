'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Check, Search, X } from 'lucide-react'
import { stacks as stacksApi } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { matchesStackQuery, fmt } from '@/lib/peptide-format'
import { useDebounce } from '@/lib/hooks/useDebounce'

/**
 * Blend picker — mirrors PeptideSelect, against the stacks endpoint. Used
 * only from ProtocolForm; the shared PeptideSelect (also used by
 * ProtocolBuilder and Tracker) stays peptide-only.
 */
export default function StackSelect({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 150)

  const { data: list = [], isPending } = useQuery({
    queryKey: qk.stacks,
    queryFn: stacksApi.list,
    staleTime: 10 * 60_000,
  })

  const filtered = useMemo(
    () => list.filter((st) => matchesStackQuery(st, debounced)),
    [list, debounced]
  )

  const selected = list.find((st) => st.id === value)

  const choose = (id) => {
    onChange(id)
    setOpen(false)
    setQuery('')
  }

  return (
    <div>
      <p className="eyebrow mb-1.5">Blend</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-[10px] border border-hairline bg-navy px-3.5 py-3 text-left text-[15px] min-h-[46px]"
      >
        <span className={selected ? 'text-tx' : 'text-tx3-body'}>
          {selected ? selected.name : 'Select blend'}
        </span>
        <span className="flex items-center gap-2">
          {selected && (
            <span
              role="button"
              tabIndex={0}
              aria-label="Clear blend"
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  onChange(null)
                }
              }}
              className="text-tx3-body hover:text-tx"
            >
              <X size={15} aria-hidden="true" />
            </span>
          )}
          <ChevronDown size={16} aria-hidden="true" className="text-tx3-body" />
        </span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/70"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Select blend"
            className="fixed inset-x-0 bottom-0 z-50 max-h-[80dvh] overflow-hidden rounded-t-[20px] border-t border-hairline bg-surface md:inset-0 md:m-auto md:h-fit md:max-w-lg md:rounded-[20px] md:border"
          >
            <div className="flex items-center justify-between gap-3 border-b border-hairline p-4">
              <h2 className="text-lg font-bold text-tx">Select blend</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="tap flex items-center justify-center text-tx3-body hover:text-tx"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="relative p-4 pb-2">
              <Search
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-7 -translate-y-1/2 text-tx3-body"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search blends…"
                aria-label="Search blends"
                className="w-full rounded-[10px] border border-hairline bg-navy py-2.5 pr-3 pl-9 text-[15px] text-tx placeholder:text-tx3-body"
              />
            </div>

            <ul className="max-h-[52dvh] overflow-y-auto p-2">
              {isPending && (
                <li className="p-4 text-sm text-tx3-body">Loading blends…</li>
              )}
              {!isPending && filtered.length === 0 && (
                <li className="p-4 text-sm text-tx3-body">
                  No blends match “{debounced}”.
                </li>
              )}
              {filtered.map((st) => (
                <li key={st.id}>
                  <button
                    type="button"
                    onClick={() => choose(st.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-3 text-left hover:bg-white/5"
                  >
                    <span>
                      <span
                        className={`block text-[15px] ${st.id === value ? 'font-bold text-teal' : 'text-tx'}`}
                      >
                        {st.name}
                      </span>
                      <span className="block text-[12px] text-tx3-body">
                        {st.stack_type === 'commercial_blend' ? 'Commercial blend' : 'Research pairing'}
                        {st.category ? ` · ${fmt(st.category)}` : ''}
                      </span>
                    </span>
                    {st.id === value && (
                      <Check size={16} aria-hidden="true" className="text-teal" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
