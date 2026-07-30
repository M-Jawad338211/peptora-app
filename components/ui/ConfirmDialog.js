'use client'

import { useEffect, useRef } from 'react'
import Button from './Button'

/**
 * Destructive-action confirmation.
 *
 * Rendered as a native <dialog> so Escape-to-close and the focus trap come
 * from the platform. Native uses Alert.alert and reaches destructive actions
 * only through an undiscoverable long-press, with no visible affordance.
 */
export default function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  pending = false,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onCancel?.()
      }}
      onClick={(e) => {
        // Backdrop click — the dialog element itself is the backdrop.
        if (e.target === ref.current) onCancel?.()
      }}
      className="m-auto w-[min(400px,calc(100vw-2rem))] rounded-card border border-hairline bg-surface p-0 text-tx backdrop:bg-black/70"
    >
      <div className="p-5">
        <h2 className="mb-2 text-lg font-bold text-tx">{title}</h2>
        {body && <p className="mb-5 text-sm leading-6 text-tx3-body">{body}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} disabled={pending}>
            {pending ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
