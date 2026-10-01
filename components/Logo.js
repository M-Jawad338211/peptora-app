import Image from 'next/image'

/**
 * The Peptora mark: the app icon, used wherever the name is shown.
 * Decorative, because the name always sits next to it.
 */
export default function Logo({ size = 34 }) {
  return (
    <Image
      src="/icons/icon-192.png"
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-[9px]"
    />
  )
}
