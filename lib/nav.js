import {
  House,
  BookOpen,
  FlaskConical,
  CircleUser,
  Calculator,
  ChartLine,
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
 */
export const NAV_ITEMS = [
  { href: '/app/home', label: 'Home', title: 'Peptora', icon: House, tab: true },
  { href: '/app/encyclopedia', label: 'Encyclopedia', title: 'Encyclopedia', icon: BookOpen, tab: true },
  { href: '/app/protocols', label: 'Protocols', title: 'Protocols', icon: FlaskConical, tab: true },
  { href: '/app/profile', label: 'Profile', title: 'Profile', icon: CircleUser, tab: true },
  { href: '/app/calculator', label: 'Calculator', title: 'Dose Calculator', icon: Calculator },
  { href: '/app/tracker', label: 'Tracker', title: 'Cycle Tracker', icon: ChartLine },
]

export const TAB_ITEMS = NAV_ITEMS.filter((i) => i.tab)

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
