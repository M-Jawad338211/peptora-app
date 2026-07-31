'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'

/**
 * Collapsible detail section.
 *
 * Uses a real <button> with aria-expanded/aria-controls, so it is keyboard
 * operable and announced correctly — native uses a TouchableOpacity with no
 * accessibility props at all.
 *
 * `count` renders as a separate element rather than being baked into the
 * title string, so screen readers announce "Benefits, 4 items" rather than
 * "Benefits (4)".
 */
export default function Section({ title, count, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  // Native only bails when `children` is falsy, but a children array is always
  // truthy — so Pharmacology/Evidence/Regulatory render as clickable headers
  // that expand to nothing whenever every row inside is null.
  if (isEmpty(children)) return null

  return (
    <section className="card mb-2.5 overflow-hidden">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={id}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
        >
          <span className="text-sm font-bold tracking-[0.3px] text-tx">
            {title}
            {count != null && (
              <span className="ml-1.5 font-normal text-tx3-body">({count})</span>
            )}
          </span>
          <ChevronDown
            size={15}
            aria-hidden="true"
            className={`shrink-0 text-tx3-body transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </h2>
      {open && (
        <div id={id} className="border-t border-hairline px-4 py-4">
          {children}
        </div>
      )}
    </section>
  )
}

/** True when nothing inside would actually render. */
function isEmpty(node) {
  if (node == null || node === false || node === '') return true
  if (Array.isArray(node)) return node.every(isEmpty)
  return false
}
