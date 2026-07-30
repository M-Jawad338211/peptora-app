import Nav from '@/components/Nav'

/**
 * Public site chrome. A route group, so it adds no URL segment — these pages
 * stay at /, /support, /privacy-policy and /download.
 *
 * Deliberately outside the PWA scope (/app/): an installed app should contain
 * the product, not the marketing site.
 */
export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-dvh bg-navy">
      <Nav />
      {children}
    </div>
  )
}
