"use client";
import { useRef, useEffect, useState } from "react";

export default function SyringeVisual({ units, maxUnits = 100 }) {
  const [currentPct, setCurrentPct] = useState(0);
  const pctRef = useRef(0);
  const rafRef = useRef(null);

  const targetPct = Math.min((units / maxUnits) * 100, 100);
  const isOverflow = units > maxUnits;

  useEffect(() => {
    const from = pctRef.current;
    const to = targetPct;
    if (Math.abs(from - to) < 0.01) return;

    const t0 = performance.now();
    const dur = 900;

    const tick = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const val = from + (to - from) * ease;
      pctRef.current = val;
      setCurrentPct(val);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetPct]);

  // SVG geometry
  const W = 640, H = 116;
  const bX = 72, bY = 24, bW = 460, bH = 52;
  const cy = bY + bH / 2; // 50

  const fillW = (currentPct / 100) * bW;
  const gX = bX + bW - fillW;  // gasket center x (moves left as fill grows)
  const fX = bX;               // flange x = left end of barrel (72)

  // Flange rect edges
  const flangeLeft  = fX - 1;        // 71
  const flangeRight = fX - 1 + 13;   // 84

  // Rod A (outside barrel): floats between thumb pad and flange with clear gaps
  const rodAStart = 36;
  const rodAEnd   = flangeLeft - 6;  // 65 — 6 px gap before flange face
  const rodAWidth = rodAEnd - rodAStart; // 29

  const fillColor = isOverflow ? "#ff6060" : "url(#sg-fill)";

  return (
    <div style={{ width: "100%" }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        color: "var(--tx3)",
        marginBottom: "8px",
      }}>
        <span>SYRINGE FILL LEVEL</span>
        <span style={{ color: isOverflow ? "#ff6060" : "var(--tx2)" }}>
          {units.toFixed(1)}&nbsp;/&nbsp;{maxUnits} units{isOverflow ? " ⚠ overflow" : ""}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", display: "block", overflow: "visible" }}
        aria-label={`Syringe: ${units.toFixed(1)} of ${maxUnits} units`}
      >
        <defs>
          <linearGradient id="sg-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f0a0" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#00b877" stopOpacity="0.96" />
          </linearGradient>
          <clipPath id="sg-barrel">
            <rect x={bX} y={bY} width={bW} height={bH} rx={4} />
          </clipPath>
        </defs>

        {/* ── Drawing order: barrel first so the flange covers its left border ── */}

        {/* 1. Barrel background — behind everything, left border hidden by flange */}
        <rect
          x={bX} y={bY} width={bW} height={bH} rx={4}
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(255,255,255,0.17)"
          strokeWidth={1.5}
        />

        {/* 2. Liquid fill */}
        <rect
          x={gX} y={bY + 5}
          width={fillW} height={bH - 10}
          rx={3}
          fill={fillColor}
          clipPath="url(#sg-barrel)"
        />

        {/* 3. Glass highlight strip */}
        <rect
          x={bX + 3} y={bY + 5}
          width={bW - 6} height={4}
          rx={2}
          fill="rgba(255,255,255,0.06)"
          clipPath="url(#sg-barrel)"
        />

        {/* 4. Rod B (inside barrel: flange face → gasket) — rx=0 so left end is
            flat and sits flush with the flange right face, no cap poking out */}
        <rect
          x={flangeRight} y={cy - 2}
          width={Math.max(gX - 5 - flangeRight, 0)} height={4}
          rx={0}
          fill="rgba(255,255,255,0.14)"
        />

        {/* 5. Flange — drawn here so it covers barrel left border and rod B left edge */}
        <rect
          x={flangeLeft} y={bY - 14}
          width={13} height={bH + 28}
          rx={4}
          fill="rgba(255,255,255,0.10)"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth={1}
        />

        {/* 6. Thumb pad */}
        <rect
          x={14} y={bY - 14}
          width={14} height={bH + 28}
          rx={5}
          fill="rgba(255,255,255,0.12)"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth={1}
        />

        {/* 7. Rod A (outside barrel: thumb-pad gap → flange gap)
            — 8 px gap after thumb pad, 6 px gap before flange face */}
        <rect
          x={rodAStart} y={cy - 2}
          width={rodAWidth} height={4}
          rx={2}
          fill="rgba(255,255,255,0.10)"
        />

        {/* 8. Tick marks — 0 at needle end (right), 100 at plunger end (left) */}
        {Array.from({ length: 21 }, (_, i) => i * 5).map((u) => {
          const x = bX + bW - (u / maxUnits) * bW;
          const major = u % 10 === 0;
          return (
            <g key={u}>
              <line
                x1={x} y1={bY + bH + 2}
                x2={x} y2={bY + bH + (major ? 12 : 7)}
                stroke={major ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.18)"}
                strokeWidth={major ? 1.5 : 1}
              />
              {major && u > 0 && (
                <text
                  x={x} y={bY + bH + 25}
                  textAnchor="middle"
                  fontSize={8.5}
                  fill="rgba(255,255,255,0.30)"
                  fontFamily="monospace"
                >
                  {u}
                </text>
              )}
            </g>
          );
        })}

        {/* 9. Plunger gasket — stays within barrel */}
        <rect
          x={gX - 5} y={bY + 2}
          width={10} height={bH - 4}
          rx={2}
          fill="rgba(160,185,255,0.50)"
          stroke="rgba(180,200,255,0.35)"
          strokeWidth={1}
        />

        {/* 10. Needle hub (right side) */}
        <path
          d={`M ${bX + bW + 14},${cy - 3} L ${bX + bW},${bY + 10} L ${bX + bW},${bY + bH - 10} L ${bX + bW + 14},${cy + 3} Z`}
          fill="rgba(180,210,230,0.15)"
          stroke="rgba(180,210,230,0.30)"
          strokeWidth={0.8}
        />

        {/* 11. Needle shaft (right side) */}
        <line
          x1={bX + bW + 14} y1={cy} x2={W - 8} y2={cy}
          stroke="rgba(180,210,230,0.55)" strokeWidth={2.5} strokeLinecap="round"
        />
      </svg>

      {isOverflow && (
        <p style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "#ff6060",
          marginTop: "6px",
          lineHeight: 1.5,
        }}>
          Dose exceeds 100-unit syringe capacity — split into multiple draws or use a larger syringe.
        </p>
      )}
    </div>
  );
}
