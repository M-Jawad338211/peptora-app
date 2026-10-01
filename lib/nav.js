import {
  House,
  BookOpen,
  FlaskConical,
  CircleUser,
  Calculator,
  ChartLine,
  Sparkles,
} from 'lucide-react'

/**
 * Every destination in the app shell.
 *
 * `pro: true` marks what needs Peptora Pro: Protocols and the Tracker, the
 * routes under app/app/(shell)/. Home, the library and the calculator are
 * free to any signed-in account and live under app/app/(open)/ with Profile
 * and Billing. Someone without Pro is never shown a link that would only
 * bounce them to the paywall.
 *
 * `tab` and `freeTab` pick the four that fit the mobile bottom bar: one set
 * for an account with Pro, another for an account without, so neither ends
 * up with a bar of two.
 */
export const NAV_ITEMS = [
  { href: '/app/home', label: 'Home', title: 'Peptora', icon: House, tab: true, freeTab: true },
  { href: '/app/encyclopedia', label: 'Library', title: 'Peptide library', icon: BookOpen, tab: true, freeTab: true },
  { href: '/app/calculator', label: 'Calculator', title: 'Reconstitution calculator', icon: Calculator, freeTab: true },
  { href: '/app/protocols', label: 'Protocols', title: 'Protocols', icon: FlaskConical, tab: true, pro: true },
  { href: '/app/tracker', label: 'Tracker', title: 'Log and history', icon: ChartLine, pro: true },
  { href: '/app/billing', label: 'Pro', title: 'Peptora Pro', icon: Sparkles },
  { href: '/app/profile', label: 'Profile', title: 'Profile', icon: CircleUser, tab: true, freeTab: true },
]

/** The destinations this account can actually open. */
export function visibleNavItems(hasAccess) {
  return hasAccess ? NAV_ITEMS : NAV_ITEMS.filter((i) => !i.pro)
}

/** The four destinations for the mobile bottom bar. */
export function tabItems(hasAccess) {
  return NAV_ITEMS.filter((i) => (hasAccess ? i.tab : i.freeTab))
}

/**
 * Match a pathname to its nav item, treating nested routes as part of their
 * section so /app/encyclopedia/bpc-157 still highlights Library. Native
 * compares with strict equality and loses the active state on detail views.
 */
export function activeNavItem(pathname) {
  return NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`)
  )
}
