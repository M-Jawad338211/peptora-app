'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { auth } from '@/lib/api'
import { errorText } from '@/lib/account'
import { refreshAccount } from '@/lib/query/account'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import SettingsCard from './SettingsCard'

/**
 * "Sign out of all other devices." The tokens are stateless, so the server
 * moves the account's token version on, which ends every other session, and
 * answers with fresh cookies for this one.
 */
export default function DevicesCard() {
  const queryClient = useQueryClient()
  const [asking, setAsking] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const signOut = useMutation({
    mutationFn: () => auth.signOutEverywhere(),
    onSuccess: async () => {
      await refreshAccount(queryClient)
      setAsking(false)
      setNotice('Signed out of your other devices.')
    },
    onError: (err) => {
      setAsking(false)
      setError(errorText(err))
    },
  })

  return (
    <SettingsCard
      title="Devices"
      description="Sign out every other browser and phone that is signed in to your account. This device stays signed in."
    >
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-3"
        onClick={() => {
          setNotice('')
          setError('')
          setAsking(true)
        }}
      >
        Sign out of all other devices
      </Button>
      {error && (
        <p role="alert" className="mt-3 text-[13px] text-danger-text">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-3 text-[13px] text-teal">
          {notice}
        </p>
      )}

      <ConfirmDialog
        open={asking}
        title="Sign out of all other devices?"
        body="Every other browser and phone signed in to your account will need to log in again. This device stays signed in."
        confirmLabel="Sign them out"
        pending={signOut.isPending}
        onConfirm={() => signOut.mutate()}
        onCancel={() => setAsking(false)}
      />
    </SettingsCard>
  )
}
