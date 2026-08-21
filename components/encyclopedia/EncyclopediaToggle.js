'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * Switches the encyclopedia between the peptide list and the stacks/blends
 * list. Shown above both, and above their detail pages too, so it doubles as
 * a quick way to jump sections without going back to the list first.
 */
export default function EncyclopediaToggle() {
  const pathname = usePathname()
  const isStacks = pathname.startsWith('/app/encyclopedia/stacks')

  const tabClass = (active) =>
    `flex-1 rounded-[10px] border px-3.5 py-2.5 text-center text-[14px] font-semibold no-underline transition-colors ${
      active
        ? 'border-teal bg-teal/12 text-teal'
        : 'border-hairline bg-white/5 text-tx2 hover:text-tx'
    }`

  return (
    <div role="tablist" aria-label="Encyclopedia section" className="mb-4 flex gap-2">
      <Link href="/app/encyclopedia" role="tab" aria-selected={!isStacks} className={tabClass(!isStacks)}>
        Peptides
      </Link>
      <Link href="/app/encyclopedia/stacks" role="tab" aria-selected={isStacks} className={tabClass(isStacks)}>
        Stacks
      </Link>
    </div>
  )
}
