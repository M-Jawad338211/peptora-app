'use client'

import { forwardRef, useEffect, useId, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { trimNum } from '@/lib/format'
import {
  SW, SH, B_X, B_W, B_Y, B_H, B_RIGHT, CY,
  VW, VH, V_BODY, V_INNER,
  clamp, stopperX, unitsAtX, vialLevel,
} from '@/lib/syringe-geometry'

/**
 * The picture that goes with the arithmetic: a vial and a syringe, drawn
 * flat, that follow the numbers as they are typed. The native app draws the
 * same one (peptora-android/src/components/VialSyringe.js).
 *
 * Two ways to interact with it:
 *   - drag the plunger sideways (or use the arrow keys), and the syringe
 *     reports the units it is set to, so the conversion can be run backwards
 *     (units to amount);
 *   - a caller can drive `setProgress(0..1)` through the ref, which replays
 *     the draw from empty up to the mark. The hold buttons use that.
 *
 * Everything shown is derived from the props. The component holds no numbers
 * of its own, so it can never disagree with the results beside it.
 */

const LIQUID = 'var(--color-teal)'
const OVER = 'var(--color-danger)'
const GLASS = 'rgba(255,255,255,0.30)'
const GLASS_FILL = 'rgba(255,255,255,0.04)'
const MONO = 'var(--font-mono)'

// A pointer has to travel this far sideways before it moves the plunger, so a
// finger resting on the picture can still scroll the page.
const DRAG_THRESHOLD_PX = 4
const EASE_MS = 420

function Vial({ vialMg, waterMl, drawnMl, animate }) {
  const clipId = `vial-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const remaining = Math.max((waterMl || 0) - (drawnMl || 0), 0)
  const level = vialLevel(waterMl) * (waterMl > 0 ? remaining / waterMl : 0)
  const liquidH = level * V_INNER.h
  const liquidY = V_INNER.y + V_INNER.h - liquidH
  const hasPowder = !(waterMl > 0) && vialMg > 0
  const ease = animate ? 'y 300ms ease-out, height 300ms ease-out' : undefined
  const easeLine = animate ? 'y1 300ms ease-out, y2 300ms ease-out' : undefined

  return (
    <svg width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`} aria-hidden="true" className="shrink-0">
      <defs>
        <clipPath id={clipId}>
          <rect x={V_INNER.x} y={V_INNER.y} width={V_INNER.w} height={V_INNER.h} rx="8" />
        </clipPath>
      </defs>

      {/* Crimp cap and neck */}
      <rect x="25" y="5" width="34" height="13" rx="3" fill="#5d6f86" />
      <rect x="25" y="14" width="34" height="2" fill="rgba(0,0,0,0.22)" />
      <rect x="31" y="18" width="22" height="13" fill={GLASS_FILL} stroke={GLASS} strokeWidth="1.4" />

      {/* Body */}
      <rect
        x={V_BODY.x} y={V_BODY.y} width={V_BODY.w} height={V_BODY.h} rx={V_BODY.r}
        fill={GLASS_FILL} stroke={GLASS} strokeWidth="1.6"
      />

      <g clipPath={`url(#${clipId})`}>
        <rect
          x={V_INNER.x} y={liquidY} width={V_INNER.w} height={Math.max(liquidH, 0)}
          fill={LIQUID} fillOpacity="0.3" style={{ transition: ease }}
        />
        {liquidH > 0.5 && (
          <line
            x1={V_INNER.x} y1={liquidY} x2={V_INNER.x + V_INNER.w} y2={liquidY}
            stroke={LIQUID} strokeWidth="1.6" strokeOpacity="0.9" style={{ transition: easeLine }}
          />
        )}
        {hasPowder && (
          <rect
            x={V_INNER.x + 5} y={V_INNER.y + V_INNER.h - 11} width={V_INNER.w - 10} height="9" rx="3"
            fill="rgba(232,237,245,0.72)"
          />
        )}
      </g>

      {/* The vial's label, so the amount stays readable at any liquid level */}
      {vialMg > 0 && (
        <>
          <rect
            x={V_BODY.x + 5} y={V_BODY.y + 26} width={V_BODY.w - 10} height="24" rx="4"
            fill="var(--color-navy)" fillOpacity="0.9" stroke={GLASS} strokeWidth="1"
          />
          <text
            x={VW / 2} y={V_BODY.y + 42.5} textAnchor="middle"
            fontSize="12" fontWeight="700" fill="var(--color-tx)" fontFamily={MONO}
          >
            {`${trimNum(vialMg, 2)} mg`}
          </text>
        </>
      )}
    </svg>
  )
}

function Syringe({ units, maxUnits, overflow, draggable, dragging }) {
  const gx = stopperX(units, maxUnits)
  const fillW = B_RIGHT - gx
  const ticks = useMemo(
    () => Array.from({ length: 11 }, (_, i) => (i * maxUnits) / 10),
    [maxUnits]
  )
  const liquid = overflow ? OVER : LIQUID
  const handle = dragging ? 'var(--color-tx)' : 'var(--color-teal)'

  return (
    <svg viewBox={`0 0 ${SW} ${SH}`} aria-hidden="true" className="block w-full">
      {/* Thumb pad and the part of the rod outside the barrel */}
      <rect x="12" y={B_Y - 4} width="11" height={B_H + 8} rx="4" fill="rgba(255,255,255,0.16)" />
      <rect x="23" y={CY - 2.5} width={B_X - 9 - 23} height="5" fill="rgba(255,255,255,0.14)" />
      {/* Finger flange */}
      <rect x={B_X - 9} y={B_Y - 9} width="9" height={B_H + 18} rx="3" fill="rgba(255,255,255,0.16)" />

      {/* Barrel */}
      <rect x={B_X} y={B_Y} width={B_W} height={B_H} rx="5" fill={GLASS_FILL} />
      {/* Rod inside the barrel, up to the stopper */}
      <rect x={B_X} y={CY - 2.5} width={Math.max(gx - B_X - 4, 0)} height="5" fill="rgba(255,255,255,0.12)" />
      {/* Liquid, from the stopper to the needle end */}
      {fillW > 0.4 && (
        <rect x={gx} y={B_Y + 3} width={fillW} height={B_H - 6} rx="3" fill={liquid} fillOpacity="0.82" />
      )}
      <rect x={B_X} y={B_Y} width={B_W} height={B_H} rx="5" fill="none" stroke={GLASS} strokeWidth="1.6" />

      {/* Stopper */}
      <rect x={gx - 4} y={B_Y + 2} width="8" height={B_H - 4} rx="2" fill="#a9bbd6" />

      {/* Grab handle above the stopper, only where the plunger can be dragged */}
      {draggable && (
        <g>
          <line x1={gx} y1={B_Y - 2} x2={gx} y2={B_Y + 2} stroke={handle} strokeWidth="2" />
          <rect x={gx - 13} y={B_Y - 16} width="26" height="14" rx="7" fill={handle} />
          <path
            d={`M ${gx - 3.5},${B_Y - 12.5} L ${gx - 7},${B_Y - 9} L ${gx - 3.5},${B_Y - 5.5} M ${gx + 3.5},${B_Y - 12.5} L ${gx + 7},${B_Y - 9} L ${gx + 3.5},${B_Y - 5.5}`}
            stroke="#021a0e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"
          />
        </g>
      )}

      {/* Needle hub and needle */}
      <path
        d={`M ${B_RIGHT},${B_Y + 8} L ${B_RIGHT + 12},${CY - 3} L ${B_RIGHT + 12},${CY + 3} L ${B_RIGHT},${B_Y + B_H - 8} Z`}
        fill="rgba(255,255,255,0.14)" stroke={GLASS} strokeWidth="1"
      />
      <line
        x1={B_RIGHT + 12} y1={CY} x2={SW - 8} y2={CY}
        stroke="rgba(200,215,235,0.7)" strokeWidth="2.2" strokeLinecap="round"
      />

      {/* Scale: a mark every tenth of the barrel, a number every fifth */}
      {ticks.map((u, i) => {
        const x = stopperX(u, maxUnits)
        const major = i % 2 === 0
        return (
          <g key={u}>
            <line
              x1={x} y1={B_Y + B_H + 3} x2={x} y2={B_Y + B_H + (major ? 13 : 8)}
              stroke={major ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'}
              strokeWidth={major ? 1.6 : 1.1}
            />
            {major && (
              <text
                x={x} y={B_Y + B_H + 27} textAnchor="middle"
                fontSize="11" fontWeight="600" fill="rgba(255,255,255,0.62)" fontFamily={MONO}
              >
                {trimNum(u, 1)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

const VialSyringe = forwardRef(function VialSyringe(
  {
    vialMg = 0,
    waterMl = 0,
    units,
    maxUnits = 100,
    syringeType = 'U-100',
    onUnitsChange,
    hint,
  },
  ref
) {
  const target = units != null && Number.isFinite(units) ? Math.max(units, 0) : null
  const overflow = target != null && target > maxUnits
  const draggable = typeof onUnitsChange === 'function' && vialMg > 0 && waterMl > 0
  const settled = Math.min(target ?? 0, maxUnits)

  // Read once. When the system asks for reduced motion the picture goes
  // straight to each new value instead of easing towards it.
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )

  const [eased, setEased] = useState(settled)
  const [progress, setProgressState] = useState(null)
  const [dragUnits, setDragUnits] = useState(null)

  const easedRef = useRef(settled)
  const raf = useRef(null)
  const drag = useRef(null) // { id, startX, startY, left, width, active, last }
  const onUnitsChangeRef = useRef(onUnitsChange)

  useEffect(() => {
    onUnitsChangeRef.current = onUnitsChange
  })

  useImperativeHandle(
    ref,
    () => ({
      /** 0..1 while a hold is running; null hands control back to the numbers. */
      setProgress(p) {
        setProgressState(p == null || p <= 0 ? null : clamp(p, 0, 1))
      },
    }),
    []
  )

  // Ease towards a new result. While the plunger is being dragged the picture
  // follows the pointer instead, and this only keeps track of where to resume.
  useEffect(() => {
    if (reduced) {
      easedRef.current = settled
      return undefined
    }
    const from = easedRef.current
    if (drag.current?.active || Math.abs(from - settled) < 0.05) {
      easedRef.current = settled
      raf.current = requestAnimationFrame(() => setEased(settled))
      return () => cancelAnimationFrame(raf.current)
    }
    const t0 = performance.now()
    const step = (now) => {
      const t = Math.min((now - t0) / EASE_MS, 1)
      const value = from + (settled - from) * (1 - Math.pow(1 - t, 3))
      easedRef.current = value
      setEased(value)
      if (t < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [settled, reduced])

  const change = (value) => {
    const d = drag.current
    if (d && d.last === value) return
    if (d) d.last = value
    setDragUnits(value)
    onUnitsChangeRef.current?.(value)
  }

  const endDrag = (e) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    setDragUnits(null)
  }

  const holding = progress != null
  const dragging = dragUnits != null
  const shown = reduced ? settled : eased
  const displayUnits = holding ? settled * progress : dragging ? dragUnits : shown
  const drawnMl = holding && waterMl > 0 ? Math.min(waterMl, (settled / maxUnits) * progress) : 0

  const readout =
    target == null
      ? '0'
      : holding
        ? String(Math.round(displayUnits))
        : dragging
          ? String(dragUnits)
          : trimNum(target, 1)

  const valueText =
    target == null
      ? 'Empty'
      : `${trimNum(target, 1)} of ${maxUnits} units${overflow ? ', more than one full syringe' : ''}`

  return (
    <div>
      <div className="flex items-center gap-4">
        <Vial vialMg={vialMg} waterMl={waterMl} drawnMl={drawnMl} animate={!reduced && !holding} />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold tracking-[0.5px] text-tx3-body uppercase">
            {syringeType} syringe
          </p>
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <span
              className={`font-mono text-[40px] leading-none font-extrabold ${
                overflow ? 'text-danger-text' : 'text-teal'
              }`}
            >
              {readout}
            </span>
            <span className="text-[15px] font-semibold text-tx2">units</span>
          </p>
          <p className="mt-1 text-[12px] text-tx3-body">
            {waterMl > 0 ? `${trimNum(waterMl, 2)} mL in the vial` : 'No water entered yet'}
          </p>
        </div>
      </div>

      <div
        role={draggable ? 'slider' : 'img'}
        tabIndex={draggable ? 0 : undefined}
        aria-label={draggable ? `${syringeType} syringe plunger` : `${syringeType} syringe, ${valueText}`}
        aria-orientation={draggable ? 'horizontal' : undefined}
        aria-valuemin={draggable ? 0 : undefined}
        aria-valuemax={draggable ? maxUnits : undefined}
        aria-valuenow={draggable ? Math.round(settled) : undefined}
        aria-valuetext={draggable ? valueText : undefined}
        className={`mx-auto mt-1.5 max-w-[560px] rounded-[8px] select-none ${
          draggable ? 'cursor-ew-resize touch-pan-y' : ''
        }`}
        onPointerDown={(e) => {
          if (!draggable || (e.pointerType === 'mouse' && e.button !== 0)) return
          const rect = e.currentTarget.getBoundingClientRect()
          drag.current = {
            id: e.pointerId,
            startX: e.clientX,
            startY: e.clientY,
            left: rect.left,
            width: rect.width,
            active: false,
            last: null,
          }
        }}
        onPointerMove={(e) => {
          const d = drag.current
          if (!d || d.id !== e.pointerId) return
          if (e.pointerType === 'mouse' && e.buttons === 0) {
            // The button was let go somewhere this element never heard about.
            drag.current = null
            setDragUnits(null)
            return
          }
          if (!d.active) {
            const dx = Math.abs(e.clientX - d.startX)
            const dy = Math.abs(e.clientY - d.startY)
            if (dx <= DRAG_THRESHOLD_PX || dx <= dy) return
            d.active = true
            e.currentTarget.setPointerCapture?.(e.pointerId)
          }
          change(unitsAtX(e.clientX - d.left, d.width, maxUnits))
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(e) => {
          const d = drag.current
          if (d && !d.active && d.id === e.pointerId) drag.current = null
        }}
        onKeyDown={(e) => {
          if (!draggable) return
          const current = Math.round(settled)
          // The stopper moves left as the syringe fills, so Left fills it.
          const next =
            e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? current + 1
            : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? current - 1
            : e.key === 'PageUp' ? current + 10
            : e.key === 'PageDown' ? current - 10
            : e.key === 'Home' ? 0
            : e.key === 'End' ? maxUnits
            : null
          if (next == null) return
          e.preventDefault()
          onUnitsChangeRef.current?.(clamp(next, 0, maxUnits))
        }}
      >
        <Syringe
          units={displayUnits}
          maxUnits={maxUnits}
          overflow={overflow}
          draggable={draggable}
          dragging={dragging}
        />
      </div>

      {overflow && (
        <p role="status" className="mt-1 text-center text-[12px] leading-5 text-danger-text">
          This draw is more than one full {maxUnits}-unit syringe.
        </p>
      )}
      {hint ? <p className="mt-1 text-center text-[12px] leading-5 text-tx3-body">{hint}</p> : null}
    </div>
  )
})

export default VialSyringe
