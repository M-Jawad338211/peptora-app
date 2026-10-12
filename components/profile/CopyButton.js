'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { copyText } from '@/lib/clipboard'
import Button from '@/components/ui/Button'

/** A button that copies `text` and says so. */
export default function CopyButton({ text, label = 'Copy', copiedLabel = 'Copied', ...props }) {
  const [state, setState] = useState('idle') // idle | copied | failed
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    const ok = await copyText(text)
    setState(ok ? 'copied' : 'failed')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setState('idle'), 2500)
  }

  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={copy} {...props}>
        {state === 'copied' ? (
          <Check size={14} aria-hidden="true" />
        ) : (
          <Copy size={14} aria-hidden="true" />
        )}
        {state === 'copied' ? copiedLabel : label}
      </Button>
      <span role="status" className="sr-only">
        {state === 'copied' ? 'Copied to the clipboard' : ''}
      </span>
      {state === 'failed' && (
        <span role="alert" className="text-[12px] text-danger-text">
          Could not copy. Select the text and copy it by hand.
        </span>
      )}
    </>
  )
}
