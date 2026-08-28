'use client'

import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { peptides as peptidesApi, calculator } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { calc_forward, to_mcg, build_result, dilution_options } from '@/lib/reconstitution'
import { protocolDefaultsFromPeptide } from '@/lib/peptideDefaults'
import { generateFingerprint } from '@/lib/fingerprint'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { useSession } from '@/lib/auth/session'
import Button from '@/components/ui/Button'
import PeptideSelect from './PeptideSelect'
import ResultsPanel from './ResultsPanel'
import DilutionPicker from './DilutionPicker'
import { ResearchBanner } from './Callouts'
import { NumberInput, ChipGroup } from './inputs'

const SYRINGE_TYPES = ['U-100', 'U-50', 'U-40']
const VIAL_PRESETS = [5, 10, 15]

export default function ProtocolBuilder({ initialPeptideId = null, onSaved }) {
  const queryClient = useQueryClient()
  const { user } = useSession()

  const [peptideId, setPeptideId] = useState(initialPeptideId)
  const [vialMg, setVialMg] = useState('')
  const [reconstituted, setReconstituted] = useState(true)
  const [unitInput, setUnitInput] = useState('mcg')
  const [unitTouched, setUnitTouched] = useState(false)
  const [syringeType, setSyringeType] = useState('U-100')
  const [bacMl, setBacMl] = useState('')
  const [targetDose, setTargetDose] = useState('')
  // The water volume the user picked, or null for "whatever you recommend".
  // Kept as a plain choice rather than a typed target so nothing has to be
  // rounded away behind their back.
  const [dilutionMl, setDilutionMl] = useState(null)

  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState(null) // {ok, message}

  const { data: peptide } = useQuery({
    queryKey: qk.peptide(peptideId),
    queryFn: () => peptidesApi.get(peptideId),
    enabled: !!peptideId,
    staleTime: 10 * 60_000,
  })

  const defaults = useMemo(
    () => (peptide ? protocolDefaultsFromPeptide(peptide) : null),
    [peptide]
  )
  const iuPerMg = peptide?.iu_per_mg ?? null
  const availableUnits = iuPerMg ? ['mcg', 'mg', 'IU'] : ['mcg', 'mg']

  // Derived rather than synced via an effect: the peptide's default unit
  // applies until the user picks one, after which theirs wins. Native
  // reapplies the default on every peptide load, silently turning a typed
  // "5 mg" into "5 mcg".
  const unit = unitTouched ? unitInput : (defaults?.dose_unit ?? 'mcg')

  // Debounced so a fast typist doesn't trigger a recalculation — and a fresh
  // 900ms syringe animation — on every keystroke.
  const dVial = useDebounce(vialMg, 250)
  const dBac = useDebounce(bacMl, 250)
  const dDose = useDebounce(targetDose, 250)

  const { result, errors, doseMcg, waterMl, dilution } = useMemo(() => {
    const vial = parseFloat(dVial)
    const rawDose = parseFloat(dDose)
    if (!vial || vial <= 0 || !rawDose || rawDose <= 0) {
      return { result: null, errors: [], doseMcg: null, waterMl: null, dilution: null }
    }

    let mcg
    try {
      mcg = to_mcg(rawDose, unit, iuPerMg)
    } catch (e) {
      return { result: null, errors: [e.message], doseMcg: null, waterMl: null, dilution: null }
    }

    if (reconstituted) {
      const bac = parseFloat(dBac)
      if (!bac || bac <= 0) {
        return { result: null, errors: [], doseMcg: mcg, waterMl: null, dilution: null }
      }
      const r = calc_forward(vial, bac, mcg, syringeType)
      if (!r.ok) return { result: null, errors: r.errors, doseMcg: mcg, waterMl: bac, dilution: null }
      return {
        // build_result is the single source of the display shape. Native
        // assembles it inline in three places, which have already drifted.
        result: {
          ok: true,
          ...build_result('forward', r, {
            peptide_name: peptide?.name,
            unit,
            target_dose: rawDose,
            syringe_type: syringeType,
            suggested_frequency: defaults?.suggested_frequency ?? null,
          }),
        },
        errors: [],
        doseMcg: mcg,
        waterMl: bac,
        dilution: null,
      }
    }

    const d = dilution_options(vial, mcg, syringeType)
    if (!d.ok) return { result: null, errors: d.errors, doseMcg: mcg, waterMl: null, dilution: null }

    // Derived rather than reset via an effect: a picked volume holds only while
    // it is still on offer, and silently falls back to the recommendation once
    // a new dose or syringe pushes it off the list.
    const water = d.options.some((o) => o.water_ml === dilutionMl)
      ? dilutionMl
      : d.recommended_water_ml

    // Computed forward from the chosen volume, so the units shown on the card
    // are exactly the units in the result — calc_inverse's snap_to_nice would
    // reintroduce the rounding this picker exists to remove.
    const r = calc_forward(vial, water, mcg, syringeType)
    if (!r.ok) return { result: null, errors: r.errors, doseMcg: mcg, waterMl: water, dilution: d }
    return {
      result: {
        ok: true,
        ...build_result('inverse', { ...r, recommended_water_ml: water, alternatives: d.options }, {
          peptide_name: peptide?.name,
          unit,
          target_dose: rawDose,
          syringe_type: syringeType,
          suggested_frequency: defaults?.suggested_frequency ?? null,
        }),
      },
      errors: [],
      doseMcg: mcg,
      waterMl: water,
      dilution: d,
    }
  }, [dVial, dBac, dDose, dilutionMl, unit, syringeType, reconstituted, iuPerMg, peptide, defaults])

  const save = async () => {
    if (!result?.ok || saving) return
    setSaving(true)
    setSaveState(null)
    try {
      const fingerprint = await generateFingerprint()
      await calculator.recordUse({
        device_fingerprint: fingerprint,
        platform: 'web',
        peptide_name: peptide?.name ?? 'Custom',
        vial_mg: parseFloat(dVial),
        bac_water_ml: waterMl ?? 0,
        // The dose in micrograms. Native sends result.syringe.draw_units here,
        // so a 250 mcg dose with a 10-unit draw is recorded as "10 mcg" and
        // every derived figure in the history view is wrong.
        target_mcg: doseMcg,
        result_units: result.syringe.draw_units,
        result_ml: result.syringe.draw_volume_ml,
      })
      queryClient.invalidateQueries({ queryKey: ['calculator'] })
      setSaveState({ ok: true, message: 'Saved to your history.' })
      onSaved?.()
    } catch (err) {
      // Native swallows this entirely — the spinner flashes and nothing is
      // saved, with no indication that anything went wrong.
      setSaveState({ ok: false, message: err.message || 'Could not save.' })
    } finally {
      setSaving(false)
    }
  }

  const rangeHint =
    defaults?.suggested_dose_low != null
      ? `Studied range: ${defaults.suggested_dose_low}${
          defaults.suggested_dose_high != null && defaults.suggested_dose_high !== defaults.suggested_dose_low
            ? `–${defaults.suggested_dose_high}`
            : ''
        } ${defaults.dose_unit} — not a recommendation.`
      : null

  return (
    <div className="mx-auto max-w-[760px]">
      <ResearchBanner />

      <div className="card space-y-4 p-4">
        <PeptideSelect value={peptideId} onChange={setPeptideId} />

        {rangeHint && (
          <p className="rounded-[10px] border border-teal/18 bg-teal/6 px-3 py-2.5 text-[12px] leading-5 text-tx2">
            {rangeHint}
          </p>
        )}

        <div>
          <NumberInput
            label="Vial strength"
            suffix="mg"
            value={vialMg}
            onChange={(e) => setVialMg(e.target.value)}
            placeholder="e.g. 5"
          />
          <div className="mt-2 flex gap-1.5">
            {VIAL_PRESETS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVialMg(String(v))}
                className="min-h-[34px] rounded-[8px] border border-hairline bg-white/5 px-3 text-[12px] text-tx2 hover:text-tx"
              >
                {v} mg
              </button>
            ))}
          </div>
        </div>

        <ChipGroup
          label="Vial state"
          value={reconstituted}
          onChange={setReconstituted}
          options={[
            { value: true, label: 'Already reconstituted' },
            { value: false, label: 'Not yet reconstituted' },
          ]}
        />

        {reconstituted && (
          <NumberInput
            label="BAC water added"
            suffix="mL"
            value={bacMl}
            onChange={(e) => setBacMl(e.target.value)}
            placeholder="e.g. 2"
          />
        )}

        <div>
          <NumberInput
            label="Target dose"
            value={targetDose}
            onChange={(e) => setTargetDose(e.target.value)}
            placeholder="e.g. 250"
          />
          <div className="mt-2">
            <ChipGroup
              options={availableUnits}
              value={unit}
              onChange={(u) => {
                setUnitTouched(true)
                setUnitInput(u)
              }}
              label="Dose unit"
            />
          </div>
        </div>

        {!reconstituted && (
          <DilutionPicker
            dilution={dilution}
            value={waterMl}
            onChange={setDilutionMl}
            syringeType={syringeType}
            doseLabel={targetDose ? `${targetDose} ${unit}` : null}
          />
        )}

        {/* Native hardcodes U-100 everywhere despite the engine and its tests
            supporting U-50 and U-40. */}
        <ChipGroup
          label="Syringe"
          options={SYRINGE_TYPES}
          value={syringeType}
          onChange={setSyringeType}
        />
      </div>

      {errors.length > 0 && (
        <ul
          role="alert"
          className="mt-3 space-y-1 rounded-[10px] border border-danger/25 bg-danger/8 p-3.5"
        >
          {errors.map((e) => (
            <li key={e} className="text-[13px] leading-5 text-danger-text">
              {e}
            </li>
          ))}
        </ul>
      )}

      <ResultsPanel result={result} peptideName={peptide?.name} />

      {result?.ok && user && (
        <div className="mt-4">
          <Button onClick={save} disabled={saving} fullWidth>
            {saving ? 'Saving…' : 'Save to history'}
          </Button>
          {saveState && (
            <p
              role="status"
              className={`mt-2 text-center text-[13px] ${saveState.ok ? 'text-teal' : 'text-danger'}`}
            >
              {saveState.message}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
