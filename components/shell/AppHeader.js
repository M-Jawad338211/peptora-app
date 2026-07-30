'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, ChartLine } from 'lucide-react'
import { activeNavItem } from '@/lib/nav'

/**
 * Sticky top bar. Carries the screen title (matching the native stack header)
 * and, on mobile only, shortcuts to the two screens that have no tab slot.
 * Without these, Calculator and Tracker would be as unreachable on the web as
 * they are in the native build.
 */
export default function AppHeader() {
  const pathname = usePathname()
  const active = activeNavItem(pathname)
  const title = active?.title ?? 'Peptora'

  const shortcuts = [
    { href: '/app/calculator', label: 'Dose calculator', icon: Calculator },
    { href: '/app/tracker', label: 'Cycle tracker', icon: ChartLine },
  ].filter((s) => !pathname.startsWith(s.href))

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-hairline bg-navy/95 px-4 backdrop-blur-md md:px-6">
      <h1 className="truncate text-[17px] font-bold text-tx">{title}</h1>

      <div className="flex items-center gap-1 md:hidden">
        {shortcuts.map((s) => {
          const Icon = s.icon
          return (
            <Link
              key={s.href}
              href={s.href}
              aria-label={s.label}
              className="tap flex items-center justify-center rounded-[10px] text-tx2 transition-colors hover:text-tx"
            >
              <Icon size={20} aria-hidden="true" strokeWidth={1.9} />
            </Link>
          )
        })}
      </div>
    </header>
  )
}
