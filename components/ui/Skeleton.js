/**
 * Shimmering placeholder. Used instead of a bare spinner so the page keeps its
 * shape while loading — native collapses a three-card stat row into a single
 * thin spinner, which jumps the layout every time.
 *
 * The pulse is suppressed under prefers-reduced-motion by the global rule.
 */
export default function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-white/6 ${className}`}
    />
  )
}
