'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TAB_ITEMS, activeNavItem } from '@/lib/nav'

/**
 * Mobile bottom tab bar. Hidden at md and above, where Sidebar takes over.
 *
 * Styling mirrors the native tab bar (peptora-android/app/(tabs)/_layout.js:38-46):
 * surface background, hairline top border, teal active / #4a5568 inactive,
 * 11px semibold labels. The extra padding-bottom is the iOS home-indicator
 * inset, which native hardcodes as `paddingBottom: 28`.
 */
export default function TabBar() {
  const pathname = usePathname()
  const active = activeNavItem(pathname)

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex h-tabbar items-stretch">
        {TAB_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active?.href === item.href
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-teal' : 'text-tab-inactive'
                }`}
              >
                <Icon
                  size={22}
                  aria-hidden="true"
                  strokeWidth={isActive ? 2.4 : 1.8}
                />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
