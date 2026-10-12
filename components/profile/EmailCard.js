'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail } from 'lucide-react'
import { auth } from '@/lib/api'
import { errorText, isWrongPassword, looksLikeEmail } from '@/lib/account'
import { refreshAccount } from '@/lib/query/account'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import CodeField from './CodeField'
import SettingsCard from './SettingsCard'

/**
 * The sign-in address and how to change it.
 *
 * The address changes only when the 6-digit code sent to the NEW address is
 * entered, so a stolen session cannot move the account to a mailbox the thief
 * controls without also reading it. While a change waits for its code,
 * /auth/me reports `pending_email` and the card says so, with the ways out:
 * enter the code, ask for another (which needs the password again) or cancel.
 */
export default function EmailCard({ user }) {
  const queryClient = useQueryClient()
  const pending = user.pending_email ?? null

  const [mode, setMode] = useState('idle') // idle | request | confirm
  const [newEmail, setNewEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const openRequest = () => {
    setMode('request')
    setNewEmail(pending ?? '')
    setPassword('')
    setErrors({})
    setFormError('')
    setNotice('')
  }

  const request = useMutation({
    mutationFn: () => auth.requestEmailChange({ newEmail, password }),
    onSuccess: async () => {
      await refreshAccount(queryClient)
      setPassword('')
      setCode('')
      setErrors({})
      setFormError('')
      setNotice('Code sent.')
      setMode('confirm')
    },
    onError: (err) => {
      if (isWrongPassword(err)) setErrors({ password: err.message })
      // Same address as now, or an address another account uses.
      else if (err.status === 400 || err.status === 409) setErrors({ email: err.message })
      else setFormError(errorText(err))
    },
  })

  const confirmCode = useMutation({
    mutationFn: () => auth.confirmEmailChange(code),
    onSuccess: async (res) => {
      await refreshAccount(queryClient)
      setMode('idle')
      setCode('')
      setErrors({})
      setNotice(`Your email address is now ${res?.email ?? 'updated'}.`)
    },
    onError: (err) => setErrors({ code: errorText(err) }),
  })

  const cancel = useMutation({
    mutationFn: () => auth.cancelEmailChange(),
    onSuccess: async () => {
      await refreshAccount(queryClient)
      setMode('idle')
      setCode('')
      setErrors({})
      setFormError('')
      setNotice('Email change cancelled.')
    },
    onError: (err) => setFormError(errorText(err)),
  })

  const submitRequest = (e) => {
    e.preventDefault()
    if (request.isPending) return
    const next = {}
    if (!looksLikeEmail(newEmail)) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Enter your password to confirm.'
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return
    request.mutate()
  }

  const submitCode = (e) => {
    e.preventDefault()
    if (confirmCode.isPending) return
    if (code.length !== 6) {
      setErrors({ code: 'Enter the 6-digit code.' })
      return
    }
    setErrors({})
    // "Code sent." has done its job once the user starts entering the code.
    setNotice('')
    confirmCode.mutate()
  }

  const busy = request.isPending || confirmCode.isPending || cancel.isPending

  return (
    <SettingsCard
      title="Email address"
      description="The address you sign in with. Changing it needs your password and a code we send to the new address."
    >
      {mode === 'request' ? (
        <form onSubmit={submitRequest} noValidate className="mt-3 space-y-3.5">
          <Field
            label="New email address"
            name="new_email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={newEmail}
            onChange={(e) => {
              setNewEmail(e.target.value)
              setErrors((p) => ({ ...p, email: undefined }))
            }}
            error={errors.email}
          />
          <Field
            label="Current password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((p) => ({ ...p, password: undefined }))
            }}
            error={errors.password}
          />
          {formError && (
            <p role="alert" className="text-[13px] text-danger-text">
              {formError}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={request.isPending}>
              {request.isPending ? 'Sending' : 'Send code'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={request.isPending}
              onClick={() => {
                setMode(pending ? 'confirm' : 'idle')
                setErrors({})
                setFormError('')
              }}
            >
              {pending ? 'Back' : 'Cancel'}
            </Button>
          </div>
        </form>
      ) : pending ? (
        <div className="mt-3">
          <p className="text-[13px] leading-5 text-tx">
            Waiting for confirmation of{' '}
            <strong className="break-all font-semibold">{pending}</strong>
          </p>
          <p className="mt-1 text-[12px] leading-5 text-tx3-body">
            We sent a 6-digit code to that address. It works for 10 minutes. You still sign in
            with <span className="inline-block max-w-full break-all">{user.email}</span>{' '}
            until you enter it.
          </p>

          {mode === 'confirm' && (
            <form onSubmit={submitCode} noValidate className="mt-3.5 space-y-3.5">
              <CodeField
                label="Confirmation code"
                name="otp"
                autoFocus
                value={code}
                onChange={(value) => {
                  setCode(value)
                  setErrors({})
                }}
                error={errors.code}
              />
              <Button type="submit" disabled={confirmCode.isPending || code.length !== 6}>
                {confirmCode.isPending ? 'Confirming' : 'Confirm'}
              </Button>
            </form>
          )}

          {formError && (
            <p role="alert" className="mt-3 text-[13px] text-danger-text">
              {formError}
            </p>
          )}
          <div className="mt-3.5 flex flex-wrap gap-2">
            {mode !== 'confirm' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={busy}
                onClick={() => {
                  setMode('confirm')
                  setNotice('')
                }}
              >
                Enter code
              </Button>
            )}
            <Button type="button" variant="secondary" size="sm" disabled={busy} onClick={openRequest}>
              Send a new code
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => {
                setFormError('')
                cancel.mutate()
              }}
            >
              {cancel.isPending ? 'Cancelling' : 'Cancel change'}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-3 flex items-center gap-3">
            <Mail size={16} aria-hidden="true" className="shrink-0 text-tx3-body" />
            <span className="min-w-0 flex-1 truncate text-[14px] text-tx">{user.email}</span>
            <span
              className={`shrink-0 text-[12px] font-semibold ${
                user.email_verified ? 'text-teal' : 'text-warn'
              }`}
            >
              {user.email_verified ? 'Verified' : 'Not verified'}
            </span>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={openRequest}
          >
            Change email
          </Button>
        </>
      )}

      {notice && mode !== 'request' && (
        <p role="status" className="mt-3 text-[13px] leading-5 text-teal">
          {notice}
        </p>
      )}
    </SettingsCard>
  )
}
