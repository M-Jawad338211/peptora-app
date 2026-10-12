'use client'

import { useState } from 'react'
import { auth } from '@/lib/api'

/**
 * The user's photo, or their initial when they have none.
 *
 * The photo is served by the API at /auth/avatar behind the session cookie, so
 * it is a plain <img> rather than next/image, which would fetch it without the
 * cookie. `avatar_updated_at` is the cache key: a new photo is a new URL.
 * If the image fails to load for any reason, the initial is shown instead.
 */
export default function Avatar({ user, size = 52, className = '' }) {
  const version = user?.avatar_updated_at ?? null
  const src = version ? auth.avatarUrl(version) : null
  // The src that failed to load. A new photo has a new src and is tried again.
  const [failed, setFailed] = useState(null)

  if (src && failed !== src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        decoding="async"
        onError={() => setFailed(src)}
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-full bg-inset object-cover ${className}`}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.385) }}
      className={`flex shrink-0 items-center justify-center rounded-full bg-teal/15 font-bold text-teal ${className}`}
    >
      {(user?.email?.[0] ?? 'P').toUpperCase()}
    </span>
  )
}
