'use client'

import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Paperclip, Upload, X } from 'lucide-react'
import { billing, ApiError } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'

// Mirrors app/utils/storage.py. Checked here only to fail fast with a useful
// message — the server re-validates from the leading bytes and is the real
// authority, since anything checked in a browser can be skipped.
const MAX_BYTES = 8 * 1024 * 1024
const ACCEPT = 'image/jpeg,image/png,image/webp,application/pdf'

export default function ClaimForm({ price, currency, slaHours = 24, onDone }) {
  const queryClient = useQueryClient()
  const fileInput = useRef(null)

  const [reference, setReference] = useState('')
  const [payerName, setPayerName] = useState('')
  const [paidAt, setPaidAt] = useState('')
  const [amount, setAmount] = useState(price != null ? String(price) : '')
  const [note, setNote] = useState('')
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)

  const submit = useMutation({
    mutationFn: async () => {
      const claim = await billing.createClaim({
        amountClaimed: amount ? Number(amount) : undefined,
        currency,
        reference: reference.trim() || undefined,
        payerName: payerName.trim() || undefined,
        paidAt: paidAt || undefined,
        userNote: note.trim() || undefined,
      })
      // Two calls rather than one multipart submit: the claim is the thing
      // that must survive. If the upload fails, the payment is still on
      // record and the receipt can be added afterwards, rather than the whole
      // submission being lost to a flaky connection.
      if (file) await billing.uploadReceipt(claim.id, file)
      return claim
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: qk.billingClaims })
      onDone?.()
    },
    onError: (err) => {
      setFormError(
        err instanceof ApiError
          ? err.message
          : 'Could not send that. Please check your connection and try again.'
      )
    },
  })

  const pickFile = (e) => {
    const chosen = e.target.files?.[0]
    if (!chosen) return
    if (chosen.size > MAX_BYTES) {
      setErrors((p) => ({ ...p, file: 'That file is larger than 8 MB. Try a screenshot instead of a photo.' }))
      return
    }
    setErrors((p) => ({ ...p, file: null }))
    setFile(chosen)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    setFormError(null)

    const next = {}
    if (!reference.trim()) {
      next.reference = 'We need this to find your payment on our side.'
    }
    if (!file) {
      next.file = 'Attach the receipt so we can verify the transfer.'
    }
    setErrors(next)
    if (Object.keys(next).length) return

    submit.mutate()
  }

  const window = slaHours >= 24 ? 'one business day' : `${slaHours} hours`

  return (
    <form onSubmit={onSubmit} className="card p-5" noValidate>
      <h2 className="mb-1 text-[15px] font-bold text-tx">Tell us about your transfer</h2>
      {/* Expectations before submission, not after. A user who knows it takes
          hours waits; one who expected instant access emails support in ten
          minutes, and then there are two problems. */}
      <p className="mb-5 text-[13px] leading-6 text-tx3-body">
        A person checks every payment, so access is not instant — usually within{' '}
        <strong className="text-tx2">{window}</strong>. We will email you as soon
        as it is done.
      </p>

      <div className="flex flex-col gap-4">
        <Field
          label="Transaction reference"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          error={errors.reference}
          hint="The transaction ID or reference number from your bank."
          placeholder="e.g. FT25091200412"
          autoComplete="off"
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={`Amount sent (${currency})`}
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
          <Field
            label="Date sent"
            type="date"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
          />
        </div>

        <Field
          label="Name on the account"
          value={payerName}
          onChange={(e) => setPayerName(e.target.value)}
          hint="Only if someone else sent it on your behalf."
          autoComplete="off"
        />

        {/* Receipt */}
        <div>
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.5px] text-tx3-body">
            Receipt
          </span>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPT}
            onChange={pickFile}
            className="sr-only"
            aria-describedby="receipt-hint"
          />
          {file ? (
            <div className="flex items-center gap-2.5 rounded-[10px] border border-hairline bg-navy px-3.5 py-3">
              <Paperclip size={15} aria-hidden="true" className="shrink-0 text-teal" />
              <span className="min-w-0 flex-1 truncate text-[13px] text-tx2">{file.name}</span>
              <button
                type="button"
                onClick={() => {
                  setFile(null)
                  if (fileInput.current) fileInput.current.value = ''
                }}
                className="tap shrink-0 rounded p-1 text-tx3-body hover:text-tx"
                aria-label={`Remove ${file.name}`}
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className={`tap flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed px-3.5 py-4 text-[13.5px] transition-colors ${
                errors.file
                  ? 'border-danger text-danger-text'
                  : 'border-hairline-strong text-tx2 hover:border-teal/40 hover:text-tx'
              }`}
            >
              <Upload size={15} aria-hidden="true" />
              Choose a screenshot or PDF
            </button>
          )}
          {errors.file ? (
            <p role="alert" className="mt-1.5 text-xs leading-5 text-danger-text">
              {errors.file}
            </p>
          ) : (
            <p id="receipt-hint" className="mt-1.5 text-xs leading-5 text-tx3-body">
              JPG, PNG, WebP or PDF, up to 8 MB. Make sure the amount, date and
              reference are readable.
            </p>
          )}
        </div>

        <Field
          as="textarea"
          rows={3}
          label="Anything else we should know"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          inputClassName="resize-y"
          hint="Optional."
        />
      </div>

      {formError && (
        <p role="alert" className="mt-4 rounded-[10px] border border-danger/30 bg-danger/5 p-3 text-[13px] leading-5 text-danger-text">
          {formError}
        </p>
      )}

      <Button type="submit" fullWidth className="mt-5" disabled={submit.isPending}>
        {submit.isPending ? 'Sending…' : 'Submit for review'}
      </Button>
    </form>
  )
}
