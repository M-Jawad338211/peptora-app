import Link from 'next/link'

/**
 * Centred auth container. The logo block and card chrome were previously
 * duplicated verbatim across all five auth pages.
 */
export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-navy px-5 py-10">
      <div className="w-full max-w-[400px]">
        <Link
          href="/"
          className="mb-8 flex items-center justify-center gap-2.5 no-underline"
        >
          <span
            aria-hidden="true"
            className="flex size-[34px] items-center justify-center rounded-[9px] border border-teal/25 bg-teal/10 text-base"
          >
            🧬
          </span>
          <span className="text-[17px] font-semibold tracking-[-0.2px] text-tx">
            Peptora
          </span>
        </Link>

        <h1 className="mb-2 text-center text-[28px] font-bold text-tx">
          {title}
        </h1>
        {subtitle && (
          <p className="mb-7 text-center text-sm leading-6 text-tx3-body">
            {subtitle}
          </p>
        )}

        <div className="card p-6">{children}</div>

        {footer && (
          <div className="mt-5 text-center text-[13px] text-tx2">{footer}</div>
        )}
      </div>
    </main>
  )
}
