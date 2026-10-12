'use client'

import Link from 'next/link'
import { CreditCard, ShieldCheck, UserRound } from 'lucide-react'
import { ACCOUNT_TABS, tabHref } from '@/lib/account'

const ICONS = { profile: UserRound, security: ShieldCheck, billing: CreditCard }

/**
 * The sub-navigation of the settings page: three links, side by side on a
 * phone and a list down the left on a wide screen.
 *
 * The section lives in the URL (/app/profile?tab=security), so it survives a
 * reload and can be linked. Moving between sections only changes that URL:
 * history.pushState is integrated with the Next router (useSearchParams sees
 * it), so there is no request to the server and nothing flashes. A click with
 * a modifier key, or a middle click, is left to the browser and opens the
 * section in a new tab as a link should.
 */
export default function AccountNav({ tab }) {
  const go = (e, key) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return
    }
    e.preventDefault()
    if (key !== tab) window.history.pushState(null, '', tabHref(key))
  }

  return (
    <nav
      aria-label="Account settings"
      className="mb-4 lg:sticky lg:top-[72px] lg:mb-0 lg:self-start"
    >
      <p className="eyebrow mb-2 hidden px-3 lg:block">Account settings</p>
      <ul className="flex gap-2 lg:flex-col lg:gap-1">
        {ACCOUNT_TABS.map(({ key, label }) => {
          const active = key === tab
          const Icon = ICONS[key]
          return (
            <li key={key} className="flex-1 lg:flex-none">
              <Link
                href={tabHref(key)}
                prefetch={false}
                onClick={(e) => go(e, key)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center justify-center gap-3 rounded-[10px] border px-3 py-2.5 text-[14px] font-semibold no-underline transition-colors lg:justify-start lg:border-transparent lg:text-sm lg:font-medium ${
                  active
                    ? 'border-teal bg-teal/12 text-teal lg:bg-teal/10'
                    : 'border-hairline bg-white/5 text-tx2 hover:text-tx lg:bg-transparent lg:hover:bg-white/5'
                }`}
              >
                <Icon size={18} aria-hidden="true" strokeWidth={1.9} className="hidden lg:block" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
