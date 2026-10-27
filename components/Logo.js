import Image from 'next/image'

/**
 * The Peptora mark, used wherever the name is shown. The vector source is
 * public/logo.svg; `unoptimized` serves it as-is, since the image optimiser
 * refuses SVG. Decorative, because the name always sits next to it.
 */
export default function Logo({ size = 34 }) {
  return (
    <Image
      src="/logo.svg"
      alt=""
      width={size}
      height={size}
      unoptimized
      className="shrink-0"
    />
  )
}
