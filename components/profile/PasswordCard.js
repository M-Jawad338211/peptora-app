'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { auth } from '@/lib/api'
import { errorText, isWrongPassword, passwordProblem } from '@/lib/account'
import { formatDate } from '@/lib/format'
import { refreshAccount } from '@/lib/query/account'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import SettingsCard from './SettingsCard'

/**
 * Change the password: current, new, new again. The server signs every other
 * device out and hands this one fresh cookies in the same answer, so nothing
 * here has to sign in again. What was typed stays in the fields when the
 * server refuses, and is cleared only once the change has gone through.
 */
export default function PasswordCard({ user }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')

  const changed = formatDate(user.password_changed_at)

  const change = useMutation({
    mutationFn: () => auth.changePassword({ currentPassword: current, newPassword: next }),
    onSuccess: async () => {
      await refreshAccount(queryClient)
      setCurrent('')
      setNext('')
      setRepeat('')
      setErrors({})
      setFormError('')
      setOpen(false)
      setNotice('Password changed. Your other devices have been signed out.')
    },
    onError: (err) => {
      if (isWrongPassword(err)) setErrors({ current: err.message })
      // A weak or unchanged password: the sentence belongs to the new field.
      else if (err.status === 400) setErrors({ next: err.message })
      else setFormError(errorText(err))
    },
  })

  const edit = (setter, field) => (e) => {
    setter(e.target.value)
    setErrors((p) => ({ ...p, [field]: undefined }))
  }

  const submit = (e) => {
    e.preventDefault()
    if (change.isPending) return
    const problem = passwordProblem({ current, next, repeat })
    setFormError('')
    setErrors(problem ? { [problem.field]: problem.message } : {})
    if (!problem) change.mutate()
  }

  const close = () => {
    setOpen(false)
    setCurrent('')
    setNext('')
    setRepeat('')
    setErrors({})
    setFormError('')
  }

  return (
    <SettingsCard
      title="Password"
      description={`${
        changed ? `Last changed on ${changed}. ` : ''
      }Changing it signs you out of your other devices.`}
    >
      {open ? (
        <form onSubmit={submit} noValidate className="mt-3 space-y-3.5">
          <Field
            label="Current password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={edit(setCurrent, 'current')}
            error={errors.current}
          />
          <Field
            label="New password"
            name="new_password"
            type="password"
            autoComplete="new-password"
            value={next}
            onChange={edit(setNext, 'next')}
            error={errors.next}
            hint="At least 8 characters."
          />
          <Field
            label="Repeat new password"
            name="repeat_password"
            type="password"
            autoComplete="new-password"
            value={repeat}
            onChange={edit(setRepeat, 'repeat')}
            error={errors.repeat}
          />
          {formError && (
            <p role="alert" className="text-[13px] text-danger-text">
              {formError}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={change.isPending}>
              {change.isPending ? 'Changing' : 'Change password'}
            </Button>
            <Button type="button" variant="secondary" disabled={change.isPending} onClick={close}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => {
            setNotice('')
            setOpen(true)
          }}
        >
          Change password
        </Button>
      )}
      {notice && !open && (
        <p role="status" className="mt-3 text-[13px] leading-5 text-teal">
          {notice}
        </p>
      )}
    </SettingsCard>
  )
}
