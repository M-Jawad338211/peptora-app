import Link from 'next/link'

const VARIANTS = {
  // The native primary button: teal fill, near-black text (#021a0e).
  primary:
    'bg-teal text-on-teal font-bold hover:bg-teal-dark disabled:opacity-60',
  secondary:
    'border border-hairline text-tx hover:border-hairline-strong disabled:opacity-60',
  // Tinted ghost — native's "Get AI summary" / secondary action style.
  ghost:
    'border border-teal/30 bg-teal/12 text-teal font-semibold hover:bg-teal/20 disabled:opacity-60',
  danger:
    'border border-danger/30 text-danger font-semibold hover:bg-danger/10 disabled:opacity-60',
}

const SIZES = {
  sm: 'px-3 py-2 text-[13px] rounded-[8px]',
  md: 'px-4 py-3 text-[15px] rounded-[12px]',
  lg: 'px-5 py-4 text-base rounded-[14px]',
}

/**
 * Renders a <button>, or an <a> when `href` is given.
 * `tap` guarantees a 44px target — native has several 26-35px controls.
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  className = '',
  fullWidth = false,
  ...props
}) {
  const cls = [
    'tap inline-flex items-center justify-center gap-2 no-underline transition-colors',
    'disabled:cursor-not-allowed',
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (href) return <Link href={href} className={cls} {...props} />
  return <button className={cls} {...props} />
}
