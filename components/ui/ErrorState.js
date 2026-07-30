import { TriangleAlert } from 'lucide-react'
import Button from './Button'

/**
 * Inline failure with a retry. Native shows a bare red string, and several
 * queries have no error branch at all — a 500 renders nothing, so the screen
 * just looks empty.
 */
export default function ErrorState({ title, message, onRetry, pending }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center px-6 py-12 text-center"
    >
      <TriangleAlert
        size={40}
        strokeWidth={1.5}
        aria-hidden="true"
        className="mb-3 text-danger"
      />
      <h2 className="mb-1.5 text-lg font-bold text-tx">{title}</h2>
      {message && (
        <p className="mb-5 max-w-[40ch] text-sm leading-6 text-tx3-body">
          {message}
        </p>
      )}
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} disabled={pending}>
          {pending ? 'Retrying…' : 'Try again'}
        </Button>
      )}
    </div>
  )
}
