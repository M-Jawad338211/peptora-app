import Link from 'next/link'

export const metadata = { title: 'Page not found · Peptora' }

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-navy px-6 text-center">
      <p className="font-mono text-xs tracking-[0.08em] text-teal">ERROR 404</p>
      <h1 className="font-display text-4xl text-tx">Page not found</h1>
      <p className="max-w-[40ch] text-sm leading-6 text-tx3-body">
        The page you were looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Link
          href="/app/home"
          className="tap inline-flex items-center rounded-[12px] bg-teal px-5 py-3 text-[15px] font-bold text-on-teal no-underline"
        >
          Open the app
        </Link>
        <Link
          href="/"
          className="tap inline-flex items-center rounded-[12px] border border-hairline px-5 py-3 text-[15px] text-tx no-underline"
        >
          Home
        </Link>
      </div>
    </div>
  )
}
