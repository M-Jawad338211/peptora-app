'use client'

import { useRef, useState } from 'react'
import { Droplet, Minus, Plus } from 'lucide-react'
import { trimNum } from '@/lib/format'
import HoldButton from '@/components/ui/HoldButton'
import VialSyringe from './VialSyringe'
import { WarningsCallout } from './Callouts'

const MAX_DOSES_PER_DAY = 12

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-[10px] border p-3 ${
        highlight ? 'border-teal/35 bg-teal/10' : 'border-hairline bg-white/4'
      }`}
    >
      <p className="font-mono text-base font-bold text-tx">{value}</p>
      <p className="mt-0.5 text-[11px] text-tx3-body">{label}</p>
    </div>
  )
}

/**
 * The figures for one calculation, with the vial and syringe picture.
 *
 * `visual={false}` leaves the picture out, for a caller that draws its own
 * (the calculator keeps it on screen before there is a result). `visualRef`
 * hands the picture to a caller that wants to replay the draw itself, and
 * `preview={false}` drops the hold button for a caller that has one already
 * (the protocol page, whose "Hold to log" button drives the same picture).
 */
export default function ResultsPanel({
  result,
  peptideName,
  vialMg,
  waterMl,
  visual = true,
  preview = true,
  visualRef,
}) {
  const [dosesPerDay, setDosesPerDay] = useState(1)
  const ownRef = useRef(null)
  const pictureRef = visualRef ?? ownRef

  if (!result?.ok) return null

  const {
    syringe,
    concentration_label,
    target_dose_label,
    doses_per_vial,
    recommended_water_ml,
    warnings,
    mode,
  } = result

  // build_result bakes a duration string from a fixed doses/day, but this
  // stepper is live — so the sentence is recomputed here rather than forking
  // the shared engine.
  const days = dosesPerDay > 0 ? Math.round(doses_per_vial / dosesPerDay) : null
  const durationNote =
    days != null
      ? `About ${doses_per_vial.toLocaleString()} doses, about ${days} day${days !== 1 ? 's' : ''} at ${dosesPerDay} a day`
      : `About ${doses_per_vial.toLocaleString()} doses`

  const units = syringe.draw_units
  const canPreview = units > 0 && units <= syringe.capacity_units

  return (
    <section
      aria-live="polite"
      className="mt-6 rounded-card border border-teal/18 bg-surface p-4 md:p-[18px]"
    >
      <h2 className="mb-3 text-base font-bold text-tx">
        {peptideName ? `Calculation for ${peptideName}` : 'Calculation'}
      </h2>

      <div className="grid grid-cols-2 gap-2">
        <StatCard label="Concentration" value={concentration_label} />
        <StatCard label="Your dose" value={target_dose_label} />
        {mode === 'inverse' && recommended_water_ml != null && (
          <StatCard
            label="Water volume"
            value={`${recommended_water_ml} mL`}
            highlight
          />
        )}
        <StatCard label="Doses per vial" value={String(doses_per_vial)} />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-[10px] border border-hairline bg-white/4 p-3.5 text-center">
          <p className="font-mono text-2xl font-bold text-tx">
            {syringe.draw_volume_ml.toFixed(3)}
          </p>
          <p className="mt-0.5 text-[11px] text-tx3-body">mL to draw</p>
        </div>
        <div className="rounded-[10px] border border-teal/25 bg-teal/8 p-3.5 text-center">
          <p className="font-mono text-2xl font-bold text-teal">
            {units.toFixed(1)}
          </p>
          <p className="mt-0.5 text-[11px] text-tx3-body">
            units on {syringe.type}
          </p>
        </div>
      </div>

      {visual && (
        <div className="mt-4 rounded-[10px] border border-hairline bg-white/4 p-3.5">
          <VialSyringe
            ref={pictureRef}
            vialMg={vialMg > 0 ? vialMg : 0}
            waterMl={waterMl > 0 ? waterMl : 0}
            units={units}
            maxUnits={syringe.capacity_units}
            syringeType={syringe.type}
          />
          {preview && (
            <HoldButton
              className="mt-3"
              icon={Droplet}
              label="Hold to preview the draw"
              holdingLabel="Drawing"
              doneLabel={`Drawn to ${trimNum(units, 1)} units`}
              duration={1100}
              disabled={!canPreview}
              onProgress={(p) => pictureRef.current?.setProgress(p)}
            />
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
        <p className="text-[13px] text-tx2">{durationNote}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setDosesPerDay((d) => Math.max(1, d - 1))}
            disabled={dosesPerDay <= 1}
            aria-label="Fewer doses per day"
            className="tap flex items-center justify-center rounded-[8px] border border-hairline text-tx2 disabled:opacity-40"
          >
            <Minus size={14} aria-hidden="true" />
          </button>
          <span className="min-w-[64px] text-center font-mono text-[13px] text-tx">
            {dosesPerDay} a day
          </span>
          <button
            type="button"
            onClick={() => setDosesPerDay((d) => Math.min(MAX_DOSES_PER_DAY, d + 1))}
            disabled={dosesPerDay >= MAX_DOSES_PER_DAY}
            aria-label="More doses per day"
            className="tap flex items-center justify-center rounded-[8px] border border-hairline text-tx2 disabled:opacity-40"
          >
            <Plus size={14} aria-hidden="true" />
          </button>
        </div>
      </div>

      <WarningsCallout warnings={warnings} />
    </section>
  )
}
