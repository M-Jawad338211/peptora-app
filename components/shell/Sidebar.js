'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { activeNavItem, visibleNavItems } from '@/lib/nav'
import { useSession } from '@/lib/auth/session'
import Logo from '@/components/Logo'

/**
 * Desktop navigation. Hidden below md, where TabBar takes over.
 *
 * Shows every destination the account can open, including the ones that do
 * not fit in the four-slot mobile tab bar.
 */
export default function Sidebar() {
  const pathname = usePathname()
  const active = activeNavItem(pathname)
  const { user } = useSession()
  const items = visibleNavItems(!!user?.access?.has_access)

  return (
    <aside
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-40 hidden w-sidebar flex-col border-r border-hairline bg-surface md:flex"
    >
      <Link
        href="/app/home"
        className="flex items-center gap-2.5 px-5 py-4 no-underline"
      >
        <Logo />
        <span className="text-[17px] font-semibold tracking-[-0.2px] text-tx">
          Peptora
        </span>
      </Link>

      <ul className="flex flex-col gap-0.5 px-3 py-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active?.href === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal/10 text-teal'
                    : 'text-tx2 hover:bg-white/5 hover:text-tx'
                }`}
              >
                <Icon size={19} aria-hidden="true" strokeWidth={1.9} />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>

      <p className="mt-auto px-5 py-4 text-[11px] leading-4 text-tx3-body italic">
        Peptora records the schedule you set. It does not recommend doses,
        and nothing here is medical advice.
      </p>
    </aside>
  )
}
