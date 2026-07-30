'use client'

import { useId } from 'react'

/**
 * Labelled input with an inline error message.
 *
 * The native app surfaces every validation failure through a native Alert
 * (~30 call sites) and has no inline field errors at all. On the web the error
 * belongs next to the field it describes, and must be announced.
 */
export default function Field({
  label,
  error,
  hint,
  className = '',
  inputClassName = '',
  as: Tag = 'input',
  ...props
}) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[11px] tracking-[0.5px] text-tx3-body uppercase"
      >
        {label}
      </label>
      <Tag
        id={id}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={[error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined}
        className={`w-full rounded-[10px] border bg-navy px-3.5 py-3 text-[15px] text-tx placeholder:text-tx3 ${
          error ? 'border-danger' : 'border-hairline'
        } ${inputClassName}`}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs leading-5 text-tx3-body">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs leading-5 text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
