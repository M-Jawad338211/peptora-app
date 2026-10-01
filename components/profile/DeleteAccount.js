'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CircleCheck, Trash2 } from 'lucide-react'
import { auth, ApiError } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'

const REMOVED = [
  'Your profile, email address and login',
  'Every protocol you saved',
  'Every log entry and your history',
  'Saved calculations',
  'Any payment records and receipt files',
]

/**
 * What is shown once the account is gone. Rendered by the Profile page in
 * place of everything else, because nothing else on it is true any more.
 */
export function DeletedNotice({ subscriptionActive }) {
  return (
    <section className="card border-teal/30 p-5 text-center" aria-live="polite">
      <CircleCheck size={36} strokeWidth={1.5} aria-hidden="true" className="mx-auto mb-3 text-teal" />
      <h2 className="mb-1.5 text-lg font-bold text-tx">Your account has been deleted</h2>
      <p className="mb-4 text-sm leading-6 text-tx3-body">
        Your profile, protocols, log and history have been removed from
        Peptora, and you are signed out.
      </p>
      {subscriptionActive && (
        <p className="mb-4 rounded-[10px] border border-warn/30 bg-warn/8 p-3 text-left text-[13px] leading-5 text-tx2">
          Your App Store subscription is still running. Deleting an account
          does not cancel it. Cancel it in your App Store account settings on
          your iPhone so that you are not charged again.
        </p>
      )}
      {/* A real navigation, not a client one: the server has to see that the
          session is gone, and the page must start again with nothing cached. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className="tap inline-flex items-center justify-center rounded-[12px] bg-teal px-5 py-3 text-[15px] font-bold text-on-teal no-underline"
      >
        Back to peptora.io
      </a>
    </section>
  )
}

/**
 * Permanent account deletion, start to finish, on this page.
 *
 * The password is asked for again so that an unlocked browser cannot erase an
 * account, and the form only opens on a deliberate click. The API does the
 * deleting in one transaction and clears the session cookies in its answer;
 * the same endpoint serves the native app.
 *
 * `onDeleted` hands the outcome to the Profile page, which then shows
 * DeletedNotice instead of the profile.
 */
export default function DeleteAccount({ user, onDeleted }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const subscribed = !!user.access?.is_subscription

  const submit = async (e) => {
    e.preventDefault()
    if (pending) return
    if (!password) {
      setError('Enter your password to confirm.')
      return
    }
    setPending(true)
    setError('')
    try {
      const res = await auth.deleteAccount(password)
      setPassword('')
      // The notice goes up first; then the page is signed out around it.
      onDeleted?.({ subscriptionActive: !!res?.app_store_subscription_active })
      // Setting the session to "signed out" is what re-renders the header and
      // the navigation, which clearing the cache alone does not do. Then
      // nothing else cached may outlive the account it belonged to.
      queryClient.setQueryData(qk.session, null)
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== qk.session[0] })
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setError('That password is not correct.')
      } else if (err instanceof ApiError && err.status === 429) {
        setError('Too many attempts. Wait a minute and try again.')
      } else {
        setError(err.message || 'Your account could not be deleted. Try again.')
      }
    } finally {
      setPending(false)
    }
  }

  if (!open) {
    return (
      <Button variant="danger" onClick={() => setOpen(true)} fullWidth>
        <Trash2 size={15} aria-hidden="true" />
        Delete account
      </Button>
    )
  }

  return (
    <section className="card border-danger/30 p-4">
      <h2 className="mb-1.5 text-base font-bold text-tx">Delete your account</h2>
      <p className="mb-3 text-[13px] leading-5 text-tx3-body">
        This permanently deletes your Peptora account ({user.email}) and
        everything stored with it. It cannot be undone, and a deleted account
        cannot be restored.
      </p>

      <ul className="mb-3 space-y-1.5">
        {REMOVED.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[13px] leading-5 text-tx2">
            <Trash2 size={13} aria-hidden="true" className="mt-1 shrink-0 text-danger" />
            {item}
          </li>
        ))}
      </ul>

      {subscribed && (
        <p className="mb-3 rounded-[10px] border border-warn/30 bg-warn/8 p-3 text-[13px] leading-5 text-tx2">
          You have an active App Store subscription. Deleting your account
          does not cancel it. Cancel it first in your App Store account
          settings on your iPhone, or Apple will keep billing you for it.
        </p>
      )}

      <form onSubmit={submit} noValidate>
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          placeholder="Enter your password to confirm"
          error={error}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="submit" variant="danger" disabled={pending || !password}>
            {pending ? 'Deleting' : 'Delete my account permanently'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => {
              setOpen(false)
              setPassword('')
              setError('')
            }}
          >
            Keep my account
          </Button>
        </div>
      </form>
    </section>
  )
}
