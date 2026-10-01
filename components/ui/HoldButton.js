'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check } from 'lucide-react'

const TONES = {
  teal: {
    track: 'border-teal/55 bg-teal/14',
    fill: 'bg-teal',
    text: 'text-teal',
    onFill: 'text-on-teal',
  },
  danger: {
    track: 'border-danger/55 bg-danger/10',
    fill: 'bg-danger',
    text: 'text-danger-text',
    onFill: 'text-white',
  },
}

// A click that arrives this soon after a key event came from that key press,
// not from assistive technology.
const KEY_CLICK_WINDOW_MS = 600

/**
 * A button that has to be held, not clicked.
 *
 * The bar fills from the left while the pointer or the key stays down, and the
 * action runs only when it reaches the end. Letting go early cancels and the
 * bar runs back. It is used where a stray click would be a nuisance (logging
 * an entry), and the fill doubles as the confirmation that the hold registered.
 * The native app has the same control (src/components/HoldButton.js).
 *
 * Mouse and touch: press and hold. Keyboard: hold Space or Enter. A screen
 * reader's activate command cannot be held, so it runs the action directly.
 *
 * `onProgress` receives 0..1 while a hold is running and null when it ends,
 * so a caller can animate something else in step with it.
 */
export default function HoldButton({
  label,
  holdingLabel = 'Keep holding',
  doneLabel,
  icon: Icon,
  duration = 900,
  tone = 'teal',
  disabled = false,
  busy = false,
  onComplete,
  onProgress,
  className = '',
}) {
  const palette = TONES[tone] ?? TONES.teal
  const hintId = useId()
  const [phase, setPhase] = useState('idle') // idle | holding | done
  const [progress, setProgress] = useState(0)

  const phaseRef = useRef('idle')
  const raf = useRef(null)
  const startedAt = useRef(0)
  const resetTimer = useRef(null)
  const lastKeyAt = useRef(-Infinity)
  const onProgressRef = useRef(onProgress)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onProgressRef.current = onProgress
    onCompleteRef.current = onComplete
  })

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current)
      clearTimeout(resetTimer.current)
    },
    []
  )

  const inactive = disabled || busy

  const go = (next) => {
    phaseRef.current = next
    setPhase(next)
  }

  const finish = () => {
    cancelAnimationFrame(raf.current)
    go('done')
    setProgress(1)
    onProgressRef.current?.(1)
    onCompleteRef.current?.()
    // Give the "done" state a moment on screen, then get ready for the next use.
    resetTimer.current = setTimeout(() => {
      go('idle')
      setProgress(0)
      onProgressRef.current?.(null)
    }, 1200)
  }

  const start = () => {
    if (inactive || phaseRef.current !== 'idle') return
    go('holding')
    startedAt.current = performance.now()
    const step = (now) => {
      const p = Math.min((now - startedAt.current) / duration, 1)
      setProgress(p)
      onProgressRef.current?.(p)
      if (p >= 1) finish()
      else raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
  }

  const release = () => {
    if (phaseRef.current !== 'holding') return
    cancelAnimationFrame(raf.current)
    go('idle')
    setProgress(0)
    onProgressRef.current?.(null)
  }

  const isHoldKey = (e) => e.key === ' ' || e.key === 'Enter'

  const text = phase === 'done' ? (doneLabel ?? label) : phase === 'holding' ? holdingLabel : label
  const ShownIcon = phase === 'done' ? Check : Icon
  // While holding, the bar follows the frame clock exactly. Otherwise it eases,
  // which is what makes an early release run back instead of snapping.
  const transition = phase === 'holding' ? 'none' : 'width 160ms ease-out, clip-path 160ms ease-out'
  const pct = progress * 100

  const content = busy ? (
    <span
      aria-hidden="true"
      className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  ) : (
    <>
      {ShownIcon ? <ShownIcon size={17} aria-hidden="true" className="shrink-0" /> : null}
      <span className="truncate">{text}</span>
    </>
  )

  return (
    <>
      <button
        type="button"
        disabled={inactive}
        aria-busy={busy || undefined}
        aria-describedby={hintId}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return
          start()
        }}
        onPointerUp={release}
        onPointerLeave={release}
        onPointerCancel={release}
        onKeyDown={(e) => {
          if (!isHoldKey(e)) return
          // Stops the browser turning the key press into a click.
          e.preventDefault()
          lastKeyAt.current = performance.now()
          if (!e.repeat) start()
        }}
        onKeyUp={(e) => {
          if (!isHoldKey(e)) return
          e.preventDefault()
          lastKeyAt.current = performance.now()
          release()
        }}
        onBlur={release}
        onClick={(e) => {
          // A pointer click has detail >= 1 and has already been handled as a
          // hold. What is left is a click with no pointer and no recent key
          // press: a screen reader activating the button.
          if (e.detail !== 0) return
          if (performance.now() - lastKeyAt.current < KEY_CLICK_WINDOW_MS) return
          if (inactive || phaseRef.current !== 'idle') return
          finish()
        }}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative block h-[52px] w-full touch-manipulation overflow-hidden rounded-[14px] border select-none [-webkit-touch-callout:none] ${
          palette.track
        } ${inactive ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
      >
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 ${palette.fill}`}
          style={{ width: `${pct}%`, transition }}
        />
        {/* The label is drawn twice: once in the tone colour on the track, and
            once in the contrasting colour clipped to the filled part, so the
            text stays readable as the bar passes underneath it. */}
        <span
          className={`relative flex h-full items-center justify-center gap-2 px-4 text-[15px] font-bold ${palette.text}`}
        >
          {content}
        </span>
        {!busy && (
          <span
            aria-hidden="true"
            className={`absolute inset-0 flex items-center justify-center gap-2 px-4 text-[15px] font-bold ${palette.onFill}`}
            style={{ clipPath: `inset(0 ${100 - pct}% 0 0)`, transition }}
          >
            {content}
          </span>
        )}
      </button>
      <span id={hintId} hidden>
        Press and hold to confirm
      </span>
    </>
  )
}
