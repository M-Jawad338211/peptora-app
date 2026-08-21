'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { protocols as protocolsApi, peptides as peptidesApi, stacks as stacksApi } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { calc_forward, calc_inverse, to_mcg, build_result } from '@/lib/reconstitution'
import { protocolDefaultsFromPeptide } from '@/lib/peptideDefaults'
import { useDebounce } from '@/lib/hooks/useDebounce'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import PeptideSelect from '@/components/calculator/PeptideSelect'
import StackSelect from '@/components/protocols/StackSelect'
import ResultsPanel from '@/components/calculator/ResultsPanel'
import { ResearchBanner } from '@/components/calculator/Callouts'
import { NumberInput, ChipGroup } from '@/components/calculator/inputs'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const FREQUENCIES = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every other day',
  'Three times/week',
  'Twice weekly',
  'Weekly',
  'As needed',
]
const SYRINGE_TYPES = ['U-100', 'U-50', 'U-40']

export default function ProtocolForm({ initialPeptideId = null, initialStackId = null }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [peptideId, setPeptideId] = useState(initialPeptideId)
  const [stackId, setStackId] = useState(initialStackId)
  const [targetType, setTargetType] = useState(initialStackId ? 'stack' : 'peptide')
  const [labelInput, setLabelInput] = useState('')
  const [labelTouched, setLabelTouched] = useState(false)
  const [vialMg, setVialMg] = useState('')
  const [reconstituted, setReconstituted] = useState(true)
  const [unitInput, setUnitInput] = useState('mcg')
  const [unitTouched, setUnitTouched] = useState(false)
  const [syringeType, setSyringeType] = useState('U-100')
  const [bacMl, setBacMl] = useState('')
  const [targetDose, setTargetDose] = useState('')
  const [preferredUnits, setPreferredUnits] = useState('20')
  const [frequency, setFrequency] = useState('')
  const [durationWeeks, setDurationWeeks] = useState('')
  const [notes, setNotes] = useState('')

  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [confirmLeave, setConfirmLeave] = useState(false)

  const { data: peptide } = useQuery({
    queryKey: qk.peptide(peptideId),
    queryFn: () => peptidesApi.get(peptideId),
    enabled: !!peptideId,
    staleTime: 10 * 60_000,
  })

  const { data: stack } = useQuery({
    queryKey: qk.stack(stackId),
    queryFn: () => stacksApi.get(stackId),
    enabled: !!stackId,
    staleTime: 10 * 60_000,
  })

  // No single "reference dose" exists for a whole blend — nothing to prefill
  // the unit/range from — so defaults only ever come from a selected peptide.
  const defaults = useMemo(
    () => (peptide ? protocolDefaultsFromPeptide(peptide) : null),
    [peptide]
  )
  const iuPerMg = peptide?.iu_per_mg ?? null
  const availableUnits = iuPerMg ? ['mcg', 'mg', 'IU'] : ['mcg', 'mg']

  // Derived, not synced via an effect: the peptide's defaults apply until the
  // user edits the field, after which their value wins. Native reapplies the
  // default on every peptide load, silently turning a typed "5 mg" into
  // "5 mcg".
  const label = labelTouched ? labelInput : (peptide?.name ?? stack?.name ?? '')
  const unit = unitTouched ? unitInput : (defaults?.dose_unit ?? 'mcg')

  const dVial = useDebounce(vialMg, 250)
  const dBac = useDebounce(bacMl, 250)
  const dDose = useDebounce(targetDose, 250)
  const dPreferred = useDebounce(preferredUnits, 250)

  const { result, engineErrors, doseMcg, waterMl } = useMemo(() => {
    const vial = parseFloat(dVial)
    const rawDose = parseFloat(dDose)
    if (!vial || vial <= 0 || !rawDose || rawDose <= 0) {
      return { result: null, engineErrors: [], doseMcg: null, waterMl: null }
    }
    let mcg
    try {
      mcg = to_mcg(rawDose, unit, iuPerMg)
    } catch (e) {
      return { result: null, engineErrors: [e.message], doseMcg: null, waterMl: null }
    }

    const opts = {
      peptide_name: peptide?.name ?? stack?.name,
      unit,
      target_dose: rawDose,
      syringe_type: syringeType,
      suggested_frequency: defaults?.suggested_frequency ?? null,
    }

    if (reconstituted) {
      const bac = parseFloat(dBac)
      if (!bac || bac <= 0) return { result: null, engineErrors: [], doseMcg: mcg, waterMl: null }
      const r = calc_forward(vial, bac, mcg, syringeType)
      if (!r.ok) return { result: null, engineErrors: r.errors, doseMcg: mcg, waterMl: bac }
      return {
        result: { ok: true, ...build_result('forward', r, opts) },
        engineErrors: [],
        doseMcg: mcg,
        waterMl: bac,
      }
    }

    const r = calc_inverse(vial, mcg, syringeType, parseFloat(dPreferred) || 20)
    if (!r.ok) return { result: null, engineErrors: r.errors, doseMcg: mcg, waterMl: null }
    return {
      result: { ok: true, ...build_result('inverse', r, opts) },
      engineErrors: [],
      doseMcg: mcg,
      waterMl: r.recommended_water_ml,
    }
  }, [dVial, dBac, dDose, dPreferred, unit, syringeType, reconstituted, iuPerMg, peptide, stack, defaults])

  const dirty =
    !!peptideId || !!stackId || !!vialMg || !!targetDose || !!bacMl || !!notes || !!frequency

  const save = useMutation({
    mutationFn: (body) => protocolsApi.create(body),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
      router.replace(`/app/protocols/${created.id}`)
    },
    onError: (err) => setSubmitError(err.message || 'Could not save the protocol.'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitError('')

    const found = {}
    const vial = parseFloat(vialMg)
    if (!vial || vial <= 0) found.vialMg = 'Enter the vial strength in mg.'
    if (!doseMcg || doseMcg <= 0) found.targetDose = 'Enter a target dose.'
    if (reconstituted && (!parseFloat(bacMl) || parseFloat(bacMl) <= 0)) {
      found.bacMl = 'Enter how much BAC water was added.'
    }
    if (durationWeeks && (!Number.isInteger(+durationWeeks) || +durationWeeks <= 0)) {
      found.durationWeeks = 'Enter a whole number of weeks.'
    }
    if (Object.keys(found).length) {
      setErrors(found)
      return
    }

    save.mutate({
      peptide_id: peptideId,
      peptide_name: peptide?.name ?? null,
      stack_id: stackId,
      stack_name: stack?.name ?? null,
      label: label.trim() || null,
      status: 'active',
      vial_mg: vial,
      reconstituted,
      bac_water_ml: waterMl ?? null,
      target_dose_mcg: doseMcg,
      unit,
      syringe_type: syringeType,
      frequency: frequency || null,
      duration_weeks: durationWeeks ? Number(durationWeeks) : null,
      notes: notes.trim() || null,
    })
  }

  const cancel = () => {
    // Native discards a fully typed protocol with no confirmation.
    if (dirty) setConfirmLeave(true)
    else router.back()
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-extrabold text-tx">New protocol</h2>
        <Button variant="secondary" size="sm" onClick={cancel}>
          Cancel
        </Button>
      </div>

      <ResearchBanner />

      <form onSubmit={handleSubmit} noValidate>
        <div className="card space-y-4 p-4">
          <ChipGroup
            label="Target"
            value={targetType}
            onChange={(v) => {
              setTargetType(v)
              if (v === 'peptide') setStackId(null)
              else setPeptideId(null)
            }}
            options={[
              { value: 'peptide', label: 'Peptide' },
              { value: 'stack', label: 'Blend' },
            ]}
          />

          {targetType === 'stack' ? (
            <StackSelect value={stackId} onChange={setStackId} />
          ) : (
            <PeptideSelect value={peptideId} onChange={setPeptideId} />
          )}

          <Field
            label="Protocol name"
            value={label}
            maxLength={80}
            onChange={(e) => {
              setLabelTouched(true)
              setLabelInput(e.target.value)
            }}
            placeholder="e.g. Morning BPC-157"
          />

          <NumberInput
            label="Vial strength"
            suffix="mg"
            value={vialMg}
            onChange={(e) => {
              setVialMg(e.target.value)
              setErrors((p) => ({ ...p, vialMg: undefined }))
            }}
            placeholder="e.g. 5"
          />
          {errors.vialMg && (
            <p role="alert" className="text-xs text-danger-text">{errors.vialMg}</p>
          )}

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
            <>
              <NumberInput
                label="BAC water added"
                suffix="mL"
                value={bacMl}
                onChange={(e) => {
                  setBacMl(e.target.value)
                  setErrors((p) => ({ ...p, bacMl: undefined }))
                }}
                placeholder="e.g. 2"
              />
              {errors.bacMl && (
                <p role="alert" className="text-xs text-danger-text">{errors.bacMl}</p>
              )}
            </>
          )}

          <div>
            <NumberInput
              label="Target dose"
              value={targetDose}
              onChange={(e) => {
                setTargetDose(e.target.value)
                setErrors((p) => ({ ...p, targetDose: undefined }))
              }}
              placeholder="e.g. 250"
            />
            <div className="mt-2">
              <ChipGroup
                label="Dose unit"
                options={availableUnits}
                value={unit}
                onChange={(u) => {
                  setUnitTouched(true)
                  setUnitInput(u)
                }}
              />
            </div>
            {errors.targetDose && (
              <p role="alert" className="mt-1 text-xs text-danger-text">{errors.targetDose}</p>
            )}
          </div>

          {!reconstituted && (
            <NumberInput
              label="Preferred draw size"
              suffix="units"
              value={preferredUnits}
              onChange={(e) => setPreferredUnits(e.target.value)}
            />
          )}

          <ChipGroup
            label="Syringe"
            options={SYRINGE_TYPES}
            value={syringeType}
            onChange={setSyringeType}
          />

          <ChipGroup
            label="Frequency"
            options={FREQUENCIES}
            value={frequency}
            onChange={setFrequency}
          />

          <NumberInput
            label="Duration"
            suffix="weeks"
            value={durationWeeks}
            maxLength={3}
            onChange={(e) => {
              setDurationWeeks(e.target.value.replace(/\D/g, ''))
              setErrors((p) => ({ ...p, durationWeeks: undefined }))
            }}
            placeholder="Optional"
          />
          {errors.durationWeeks && (
            <p role="alert" className="text-xs text-danger-text">{errors.durationWeeks}</p>
          )}

          <Field
            as="textarea"
            label="Notes"
            rows={3}
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
            inputClassName="resize-y"
          />
        </div>

        {engineErrors.length > 0 && (
          <ul role="alert" className="mt-3 space-y-1 rounded-[10px] border border-danger/25 bg-danger/8 p-3.5">
            {engineErrors.map((e) => (
              <li key={e} className="text-[13px] leading-5 text-danger-text">{e}</li>
            ))}
          </ul>
        )}

        <ResultsPanel result={result} peptideName={peptide?.name ?? stack?.name} />

        {submitError && (
          <p role="alert" className="mt-3 text-[13px] text-danger-text">{submitError}</p>
        )}

        <div className="mt-4">
          <Button type="submit" disabled={save.isPending} size="lg" fullWidth>
            {save.isPending ? 'Saving…' : 'Save protocol'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmLeave}
        title="Discard this protocol?"
        body="You have unsaved changes. Leaving now will lose them."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => router.back()}
        onCancel={() => setConfirmLeave(false)}
      />
    </div>
  )
}
