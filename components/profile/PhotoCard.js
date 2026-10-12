'use client'

import { useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, Trash2 } from 'lucide-react'
import { auth } from '@/lib/api'
import { AVATAR_TYPES, avatarFileProblem, errorText } from '@/lib/account'
import { refreshAccount } from '@/lib/query/account'
import Button from '@/components/ui/Button'
import Avatar from './Avatar'

/**
 * The profile header: photo (or initial), name and address, and the buttons
 * that add, change or remove the photo. The server crops the upload to a
 * 256 px square and keeps nothing of the original, so what shows afterwards
 * is the server's copy, loaded again under a new URL.
 */
export default function PhotoCard({ user }) {
  const queryClient = useQueryClient()
  const input = useRef(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const hasPhoto = !!user.avatar_updated_at

  const upload = useMutation({
    mutationFn: (file) => auth.uploadAvatar(file),
    onSuccess: async () => {
      await refreshAccount(queryClient)
      setNotice('Photo updated.')
    },
    onError: (err) => setError(errorText(err)),
  })

  const remove = useMutation({
    mutationFn: () => auth.deleteAvatar(),
    onSuccess: async () => {
      await refreshAccount(queryClient)
      setNotice('Photo removed.')
    },
    onError: (err) => setError(errorText(err)),
  })

  const busy = upload.isPending || remove.isPending

  const choose = (e) => {
    const file = e.target.files?.[0]
    // Cleared so that choosing the same file again still fires a change.
    e.target.value = ''
    if (!file) return
    setNotice('')
    const problem = avatarFileProblem(file)
    if (problem) {
      setError(problem)
      return
    }
    setError('')
    upload.mutate(file)
  }

  return (
    <section className="card p-4">
      <div className="flex items-center gap-3.5">
        <Avatar user={user} size={64} />
        <div className="min-w-0">
          {user.full_name && (
            <p className="truncate text-base font-bold text-tx">{user.full_name}</p>
          )}
          <p className="truncate text-[13px] text-tx2">{user.email}</p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-2">
        {/* The visible buttons are the controls; the input only opens the
            file chooser for them. */}
        <input
          ref={input}
          type="file"
          accept={AVATAR_TYPES.join(',')}
          onChange={choose}
          hidden
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={busy}
          onClick={() => input.current?.click()}
        >
          <Camera size={14} aria-hidden="true" />
          {upload.isPending ? 'Uploading' : hasPhoto ? 'Change photo' : 'Add photo'}
        </Button>
        {hasPhoto && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={busy}
            onClick={() => {
              setError('')
              setNotice('')
              remove.mutate()
            }}
          >
            <Trash2 size={14} aria-hidden="true" />
            {remove.isPending ? 'Removing' : 'Remove photo'}
          </Button>
        )}
      </div>

      <p className="mt-2 text-[12px] leading-5 text-tx3-body">
        JPG, PNG or WebP, up to 5 MB. It is cropped to a square.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-danger-text">
          {error}
        </p>
      )}
      {notice && !error && (
        <p role="status" className="mt-2 text-[13px] text-teal">
          {notice}
        </p>
      )}
    </section>
  )
}
