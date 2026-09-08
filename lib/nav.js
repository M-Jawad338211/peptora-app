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
 * `tab: true` marks the four that appear in the mobile bottom bar — the same
 * four the native app shows (peptora-android/app/(tabs)/_layout.js:51-54).
 * Calculator and Tracker are deliberately NOT tabs: six is too many on a
 * phone. They are reachable from the Home quick actions and the header, which
 * fixes the native bug where both screens are registered with `href: null`
 * and are therefore unreachable in the shipped build.
 *
 * `licensed: false` marks the destinations that survive the licence gate —
 * the ones under app/app/(open)/. Everything else redirects to /app/billing
 * without one.
 */
export const NAV_ITEMS = [
  { href: '/app/home', label: 'Home', title: 'Peptora', icon: House, tab: true, licensed: true },
  { href: '/app/encyclopedia', label: 'Encyclopedia', title: 'Encyclopedia', icon: BookOpen, tab: true, licensed: true },
  { href: '/app/protocols', label: 'Protocols', title: 'Protocols', icon: FlaskConical, tab: true, licensed: true },
  { href: '/app/profile', label: 'Profile', title: 'Profile', icon: CircleUser, tab: true, licensed: false },
  { href: '/app/calculator', label: 'Calculator', title: 'Dose Calculator', icon: Calculator, licensed: true },
  { href: '/app/tracker', label: 'Tracker', title: 'Cycle Tracker', icon: ChartLine, licensed: true },
  { href: '/app/billing', label: 'Licence', title: 'Your licence', icon: Sparkles, licensed: false },
]

export const TAB_ITEMS = NAV_ITEMS.filter((i) => i.tab)

/**
 * The destinations to actually render for this user.
 *
 * Without this, someone sitting on the paywall sees a full menu where every
 * item bounces straight back to the paywall — which reads as the app being
 * broken rather than locked. Showing only what they can open is honest, and
 * the billing entry is right there.
 */
export function visibleNavItems(items, hasAccess) {
  return hasAccess ? items : items.filter((i) => !i.licensed)
}

/**
 * Match a pathname to its nav item, treating nested routes as part of their
 * section so /app/encyclopedia/bpc-157 still highlights Encyclopedia. Native
 * compares with strict equality and loses the active state on detail views.
 */
export function activeNavItem(pathname) {
  return NAV_ITEMS.find(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`)
  )
}
