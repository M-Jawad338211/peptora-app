'use client'

import { useEffect, useRef, useState } from 'react'
import { TriangleAlert } from 'lucide-react'

/**
 * Insulin syringe fill indicator.
 *
 * Geometry is reconciled to the native implementation
 * (peptora-android/src/components/SyringeVisual.js) so both apps draw the
 * same instrument: viewBox 620x134, barrel x=68 y=18 w=430 h=52, fill runs
 * right-to-left from the needle end, ticks every 10 units, labels every 20.
 */
const VIEW_W = 620
const VIEW_H = 134
const BARREL_X = 68
const BARREL_Y = 18
const BARREL_W = 430
const BARREL_H = 52
const CY = BARREL_Y + BARREL_H / 2
const DURATION_MS = 900

const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

export default function SyringeVisual({ units = 0, maxUnits = 100 }) {
  const targetPct = Math.min((units / maxUnits) * 100, 100)
  const isOverflow = units > maxUnits

  const [pct, setPct] = useState(targetPct)
  const fromRef = useRef(targetPct)
  const rafRef = useRef(null)

  // Read once on mount. Native animates unconditionally; when the OS asks for
  // reduced motion we render the value directly and skip the tween entirely,
  // which also avoids driving state from inside an effect.
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    if (reduced) {
      fromRef.current = targetPct
      return
    }

    const from = fromRef.current
    const delta = targetPct - from
    if (Math.abs(delta) < 0.01) return

    const start = performance.now()
    const tick = (now) => {
      const t = Math.min((now - start) / DURATION_MS, 1)
      setPct(from + delta * easeInOutQuad(t))
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = targetPct
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [targetPct, reduced])

  const displayPct = reduced ? targetPct : pct
  const fillW = (displayPct / 100) * BARREL_W
  const fillX = BARREL_X + BARREL_W - fillW

  const ticks = []
  for (let u = 0; u <= maxUnits; u += 10) {
    ticks.push({
      u,
      x: BARREL_X + BARREL_W - (u / maxUnits) * BARREL_W,
      major: u % 20 === 0,
    })
  }

  return (
    <figure className="mt-5">
      <figcaption className="mb-1.5 flex items-center justify-between font-mono text-[10px] tracking-[0.5px] text-tx3-body uppercase">
        <span>Syringe fill level</span>
        <span className={isOverflow ? 'flex items-center gap-1 text-[#ff6060]' : ''}>
          {isOverflow && <TriangleAlert size={11} aria-hidden="true" />}
          {units.toFixed(1)} / {maxUnits} IU{isOverflow ? ' overflow' : ''}
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={`Syringe filled to ${units.toFixed(1)} of ${maxUnits} units${
          isOverflow ? ', exceeding capacity' : ''
        }`}
        className="w-full"
      >
        <defs>
          <linearGradient id="syringe-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#00f0a0" />
            <stop offset="1" stopColor="#00b877" />
          </linearGradient>
          <clipPath id="syringe-clip">
            <rect
              x={BARREL_X + 5}
              y={BARREL_Y + 5}
              width={BARREL_W - 10}
              height={BARREL_H - 10}
              rx="3"
            />
          </clipPath>
        </defs>

        {/* Plunger rod, thumb pad and flange */}
        <rect x="28" y={CY - 4} width="42" height="8" fill="rgba(255,255,255,0.18)" />
        <rect x="14" y={CY - 22} width="14" height="44" rx="5" fill="rgba(255,255,255,0.22)" />
        <rect
          x={BARREL_X - 1}
          y={BARREL_Y - 14}
          width="13"
          height={BARREL_H + 28}
          rx="3"
          fill="rgba(255,255,255,0.20)"
        />

        {/* Barrel */}
        <rect
          x={BARREL_X}
          y={BARREL_Y}
          width={BARREL_W}
          height={BARREL_H}
          rx="4"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.17)"
          strokeWidth="1.5"
        />

        {/* Liquid — fills from the needle end */}
        <g clipPath="url(#syringe-clip)">
          <rect
            x={fillX}
            y={BARREL_Y + 5}
            width={fillW}
            height={BARREL_H - 10}
            fill={isOverflow ? '#ff6060' : 'url(#syringe-fill)'}
          />
        </g>

        {/* Glass highlight */}
        <rect
          x={BARREL_X + 6}
          y={BARREL_Y + 8}
          width={BARREL_W - 12}
          height="4"
          rx="2"
          fill="rgba(255,255,255,0.06)"
        />

        {/* Plunger gasket */}
        <rect
          x={BARREL_X + 12}
          y={CY - 24}
          width="10"
          height="48"
          rx="2"
          fill="rgba(160,185,255,0.50)"
        />

        {/* Ticks */}
        {ticks.map(({ u, x, major }) => (
          <g key={u}>
            <line
              x1={x}
              y1={BARREL_Y + BARREL_H}
              x2={x}
              y2={BARREL_Y + BARREL_H + (major ? 22 : 11)}
              stroke={major ? 'rgba(255,255,255,0.60)' : 'rgba(255,255,255,0.28)'}
              strokeWidth={major ? 2 : 1.2}
            />
            {major && (
              <text
                x={x}
                y="110"
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fontFamily="ui-monospace, monospace"
                fill="rgba(255,255,255,0.65)"
              >
                {u}
              </text>
            )}
          </g>
        ))}

        {/* Needle hub and shaft */}
        <path
          d={`M${BARREL_X + BARREL_W} ${CY - 9} L${BARREL_X + BARREL_W + 22} ${CY - 4} L${BARREL_X + BARREL_W + 22} ${CY + 4} L${BARREL_X + BARREL_W} ${CY + 9} Z`}
          fill="rgba(180,210,230,0.30)"
        />
        <line
          x1={BARREL_X + BARREL_W + 22}
          y1={CY}
          x2="612"
          y2={CY}
          stroke="rgba(180,210,230,0.55)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>

      {isOverflow && (
        <p role="status" className="mt-2 text-[13px] leading-5 text-[#ff6060]">
          Dose exceeds the {maxUnits}-unit syringe capacity — split into
          multiple draws or use a larger syringe.
        </p>
      )}
    </figure>
  )
}
