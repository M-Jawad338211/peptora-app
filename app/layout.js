import { DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/components/Providers'

// Named --font-dm-* rather than --font-sans/--font-mono: globals.css defines
// the Tailwind `--font-sans` theme token as `var(--font-dm-sans), system-ui`,
// and a variable cannot reference itself.
const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
})

export const metadata = {
  title: 'Peptora — Research Intelligence Platform',
  description: 'Precision tools and research-backed intelligence for peptide scientists.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Peptora',
  },
}

export const viewport = {
  themeColor: '#1a2535',
  width: 'device-width',
  initialScale: 1,
  // Lets the app paint under the notch / home indicator so env(safe-area-inset-*)
  // can be used for the bottom tab bar.
  viewportFit: 'cover',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
