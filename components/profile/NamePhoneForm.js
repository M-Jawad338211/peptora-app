'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { auth } from '@/lib/api'
import { errorText, phoneProblem } from '@/lib/account'
import { refreshAccount } from '@/lib/query/account'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import SettingsCard from './SettingsCard'

/**
 * Full name and contact phone number.
 *
 * Only what changed is sent. The phone is a contact number and nothing else:
 * the server stores it without checking it belongs to anyone, so nothing here
 * says "verified". What the user typed stays in the fields if the save fails.
 */
export default function NamePhoneForm({ user }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(user.full_name ?? '')
  const [phone, setPhone] = useState(user.phone ?? '')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saved, setSaved] = useState(false)

  const nameChanged = name.trim() !== (user.full_name ?? '')
  const phoneChanged = phone.trim() !== (user.phone ?? '')

  const save = useMutation({
    mutationFn: () =>
      auth.updateProfile({
        fullName: nameChanged ? name.trim() : undefined,
        phone: phoneChanged ? phone.trim() || null : undefined,
      }),
    onSuccess: async (res) => {
      await refreshAccount(queryClient)
      // What the server stored: the name trimmed, the number without spaces.
      setName(res.full_name ?? '')
      setPhone(res.phone ?? '')
      setSaved(true)
    },
    onError: (err) => setFormError(errorText(err)),
  })

  const edit = (setter) => (e) => {
    setter(e.target.value)
    setSaved(false)
    setFormError('')
    setErrors({})
  }

  const submit = (e) => {
    e.preventDefault()
    if (save.isPending) return
    const next = {}
    if (nameChanged && !name.trim()) next.name = 'Enter your name.'
    const problem = phoneProblem(phone)
    if (phoneChanged && problem) next.phone = problem
    setErrors(next)
    setFormError('')
    setSaved(false)
    if (Object.keys(next).length) return
    save.mutate()
  }

  return (
    <SettingsCard title="Name and phone">
      <form onSubmit={submit} noValidate className="mt-3 space-y-3.5">
        <Field
          label="Full name"
          name="full_name"
          autoComplete="name"
          maxLength={255}
          value={name}
          onChange={edit(setName)}
          error={errors.name}
        />
        <Field
          label="Phone number"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+14155550123"
          value={phone}
          onChange={edit(setPhone)}
          error={errors.phone}
          hint="Include the country code, for example +14155550123. This is a contact number and is not verified."
        />

        {formError && (
          <p role="alert" className="text-[13px] text-danger-text">
            {formError}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={save.isPending || !(nameChanged || phoneChanged)}>
            {save.isPending ? 'Saving' : 'Save changes'}
          </Button>
          {saved && (
            <p role="status" className="text-[13px] text-teal">
              Saved.
            </p>
          )}
        </div>
      </form>
    </SettingsCard>
  )
}
