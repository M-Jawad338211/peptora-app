'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { recoveryCodesText } from '@/lib/account'
import { downloadText } from '@/lib/clipboard'
import Button from '@/components/ui/Button'
import CopyButton from './CopyButton'

/**
 * The ten recovery codes, shown once.
 *
 * Only their hashes are stored, so this is the one chance to keep them. The
 * dialog is modal, cannot be dismissed with Escape or by clicking outside, and
 * the page asks before it is closed or reloaded. It ends only when the user
 * says they have saved the codes. It is rendered by the settings page itself,
 * not by the two-factor card, so moving to another section (or the browser's
 * Back button) cannot take it away.
 */
export default function RecoveryCodesDialog({ codes, email, onDone }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (codes && !el.open) el.showModal()
    if (!codes && el.open) el.close()
  }, [codes])

  useEffect(() => {
    if (!codes) return
    const ask = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', ask)
    return () => window.removeEventListener('beforeunload', ask)
  }, [codes])

  return (
    <dialog
      ref={ref}
      // Escape would close a native dialog; here it must not.
      onCancel={(e) => e.preventDefault()}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(440px,calc(100vw-2rem))] overflow-y-auto rounded-card border border-hairline bg-surface p-0 text-tx backdrop:bg-black/70"
    >
      {codes && <Codes codes={codes} email={email} onDone={onDone} />}
    </dialog>
  )
}

function Codes({ codes, email, onDone }) {
  const titleId = useId()
  const [saved, setSaved] = useState(false)

  return (
    <div className="p-5" role="group" aria-labelledby={titleId}>
      <h2 id={titleId} className="mb-2 text-lg font-bold text-tx">
        Save your recovery codes
      </h2>
      <p className="mb-3 text-[13px] leading-5 text-tx3-body">
        Each code works once. If you lose your authenticator app, a recovery code is the only way
        to sign in. We show these codes only now, so keep them somewhere private, such as a
        password manager.
      </p>

      <ol
        aria-label="Recovery codes"
        className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-[10px] border border-hairline bg-navy p-3 font-mono text-[13px] text-tx"
      >
        {codes.map((code) => (
          <li key={code} className="select-all">
            {code}
          </li>
        ))}
      </ol>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <CopyButton text={codes.join('\n')} label="Copy codes" aria-label="Copy recovery codes" />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            downloadText('peptora-recovery-codes.txt', recoveryCodesText({ codes, email }))
          }
        >
          <Download size={14} aria-hidden="true" />
          Download
        </Button>
      </div>

      <label className="tap mb-4 flex cursor-pointer items-start gap-3 text-[14px] leading-5 text-tx">
        <input
          type="checkbox"
          checked={saved}
          onChange={(e) => setSaved(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 accent-teal"
        />
        I have saved these codes
      </label>

      <Button type="button" fullWidth disabled={!saved} onClick={onDone}>
        Done
      </Button>
    </div>
  )
}
