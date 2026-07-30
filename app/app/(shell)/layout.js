import AppShell from '@/components/shell/AppShell'

export const metadata = {
  title: 'Peptora',
}

/**
 * Wraps the product screens in the tab-bar/sidebar chrome.
 *
 * This is a route group, so it adds no URL segment. Auth and consent live
 * outside it: they are inside the PWA scope (/app/...) but must render
 * without navigation chrome.
 */
export default function ShellLayout({ children }) {
  return <AppShell>{children}</AppShell>
}
