'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import { NumberInput, ChipGroup } from '@/components/calculator/inputs'
import { formatDoseFromMcg } from '@/lib/format'

const AGO_OPTIONS = [
  { value: 0, label: 'Now' },
  { value: 30, label: '30m ago' },
  { value: 60, label: '1h ago' },
  { value: 120, label: '2h ago' },
  { value: 180, label: '3h ago' },
]

export default function DoseLogForm({ protocol, onSubmit, pending, error }) {
  // Prefilled from the protocol's target dose, converted to its display unit.
  const [dose, setDose] = useState(() =>
    formatDoseFromMcg(protocol.target_dose_mcg, protocol.unit)
  )
  const [minutesAgo, setMinutesAgo] = useState(0)
  const [notes, setNotes] = useState('')

  const handle = (e) => {
    e.preventDefault()
    if (!dose.trim()) return
    const takenAt = new Date(Date.now() - minutesAgo * 60_000)
    onSubmit({
      peptide_name: protocol.peptide_name || protocol.label || 'Dose',
      dose: dose.trim(),
      notes: notes.trim() || null,
      taken_at: takenAt.toISOString(),
    })
    setNotes('')
    setMinutesAgo(0)
  }

  return (
    <form onSubmit={handle} className="rounded-[10px] bg-white/4 p-3.5">
      <NumberInput
        label="Dose"
        value={dose}
        onChange={(e) => setDose(e.target.value)}
        placeholder="e.g. 250 mcg"
        className="mb-3"
      />

      <div className="mb-3">
        <ChipGroup
          label="When?"
          options={AGO_OPTIONS}
          value={minutesAgo}
          onChange={setMinutesAgo}
        />
      </div>

      <Field
        as="textarea"
        label="Notes"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional"
        className="mb-3"
        inputClassName="resize-y"
      />

      {error && (
        <p role="alert" className="mb-2 text-[13px] text-danger-text">
          {error}
        </p>
      )}

      <Button type="submit" size="sm" disabled={pending || !dose.trim()} fullWidth>
        <Plus size={14} aria-hidden="true" />
        {pending ? 'Logging…' : 'Log dose'}
      </Button>
    </form>
  )
}
