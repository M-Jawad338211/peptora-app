'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2, Plus, X } from 'lucide-react'
import { protocols as protocolsApi } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { formatDate, formatDateTime, daysSince, formatDoseFromMcg } from '@/lib/format'
import { calc_forward, build_result } from '@/lib/reconstitution'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ResultsPanel from '@/components/calculator/ResultsPanel'
import Section from '@/components/encyclopedia/Section'
import DoseLogForm from './DoseLogForm'
import { STATUS_META } from './ProtocolCard'

const STATUSES = ['active', 'paused', 'completed']

function CycleCell({ label, value }) {
  return (
    <div>
      <p className="eyebrow mb-0.5 text-[10px]">{label}</p>
      <p className="text-sm font-semibold text-tx">{value ?? '—'}</p>
    </div>
  )
}

export default function ProtocolDetail({ id }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showLogForm, setShowLogForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmLog, setConfirmLog] = useState(null)
  const [logError, setLogError] = useState('')

  const { data: p, isPending, error, refetch, isFetching } = useQuery({
    queryKey: qk.protocol(id),
    queryFn: () => protocolsApi.get(id),
  })

  // Every protocol mutation touches the list, the stats summary, and the
  // tracker feed — deleting a protocol cascade-deletes its dose logs, and
  // native never refreshes any of those, so its counters go stale.
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['protocols'] })
    queryClient.invalidateQueries({ queryKey: qk.trackerLogs })
  }

  const setStatus = useMutation({
    mutationFn: (status) => protocolsApi.update(id, { status }),
    onSuccess: (updated) => {
      queryClient.setQueryData(qk.protocol(id), (prev) => ({ ...prev, ...updated }))
      invalidateAll()
    },
  })

  const addLog = useMutation({
    mutationFn: (body) => protocolsApi.addLog(id, body),
    onSuccess: () => {
      setShowLogForm(false)
      setLogError('')
      queryClient.invalidateQueries({ queryKey: qk.protocol(id) })
      invalidateAll()
    },
    onError: (err) => setLogError(err.message || 'Could not log the dose.'),
  })

  const removeLog = useMutation({
    mutationFn: (logId) => protocolsApi.removeLog(id, logId),
    onSuccess: () => {
      setConfirmLog(null)
      queryClient.invalidateQueries({ queryKey: qk.protocol(id) })
      invalidateAll()
    },
  })

  const remove = useMutation({
    mutationFn: () => protocolsApi.remove(id),
    onSuccess: () => {
      invalidateAll()
      router.replace('/app/protocols')
    },
  })

  if (isPending) {
    return (
      <div className="mx-auto max-w-[760px] space-y-3">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load this protocol"
        message={error.message}
        onRetry={() => refetch()}
        pending={isFetching}
      />
    )
  }

  const title = p.label || p.peptide_name || p.stack_name || 'Untitled protocol'
  const day = p.start_date != null ? daysSince(p.start_date) : null

  // Recompute the calculation from the stored configuration.
  const calc =
    p.bac_water_ml && p.vial_mg && p.target_dose_mcg
      ? (() => {
          const r = calc_forward(
            Number(p.vial_mg),
            Number(p.bac_water_ml),
            Number(p.target_dose_mcg),
            p.syringe_type || 'U-100'
          )
          return r.ok
            ? {
                ok: true,
                ...build_result('forward', r, {
                  peptide_name: p.peptide_name || p.stack_name,
                  unit: p.unit,
                  target_dose: formatDoseFromMcg(p.target_dose_mcg, p.unit).split(' ')[0],
                  syringe_type: p.syringe_type || 'U-100',
                  suggested_frequency: p.frequency,
                }),
              }
            : null
        })()
      : null

  const logs = p.dose_logs ?? []

  return (
    <div className="mx-auto max-w-[760px]">
      <Link
        href="/app/protocols"
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-teal no-underline"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Protocols
      </Link>

      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[22px] font-extrabold text-tx">{title}</h2>
          {(p.peptide_name || p.stack_name) && p.label && (
            <p className="text-[13px] text-tx3-body">{p.peptide_name || p.stack_name}</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          aria-label="Delete protocol"
          className="tap flex shrink-0 items-center justify-center rounded-[8px] text-danger hover:bg-danger/10"
        >
          <Trash2 size={17} aria-hidden="true" />
        </button>
      </div>

      {/* Status */}
      <div role="radiogroup" aria-label="Protocol status" className="mb-3 flex gap-1.5">
        {STATUSES.map((s) => {
          const meta = STATUS_META[s]
          const active = p.status === s
          const Icon = meta.Icon
          return (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={setStatus.isPending}
              onClick={() => setStatus.mutate(s)}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[20px] border px-3.5 text-[13px] font-semibold disabled:opacity-60"
              style={
                active
                  ? {
                      color: meta.color,
                      backgroundColor: `${meta.color}22`,
                      borderColor: `${meta.color}66`,
                    }
                  : undefined
              }
            >
              <Icon size={13} aria-hidden="true" />
              {meta.label}
            </button>
          )
        })}
      </div>

      {setStatus.isError && (
        <p role="alert" className="mb-3 text-[13px] text-danger-text">
          {setStatus.error.message}
        </p>
      )}

      {/* Cycle */}
      <div className="card mb-2.5 grid grid-cols-2 gap-4 p-4">
        <CycleCell label="Started" value={p.start_date ? formatDate(p.start_date) : null} />
        <CycleCell label="Day" value={day != null ? `#${day + 1}` : null} />
        <CycleCell
          label="Duration"
          value={p.duration_weeks ? `${p.duration_weeks} wks` : 'Open'}
        />
        <CycleCell label="Frequency" value={p.frequency} />
        {p.notes && (
          <div className="col-span-2 rounded-[8px] bg-white/4 p-3">
            <p className="text-[13px] leading-5 text-tx2">{p.notes}</p>
          </div>
        )}
      </div>

      {calc && (
        <Section title="Calculation">
          <ResultsPanel result={calc} peptideName={p.peptide_name} />
        </Section>
      )}

      {/* Dose log */}
      <section className="card mt-2.5 p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-tx">
            Dose log{' '}
            <span className="font-normal text-tx3-body">({logs.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => setShowLogForm((v) => !v)}
            className="tap inline-flex items-center gap-1 px-2 text-[13px] font-semibold text-teal"
          >
            {showLogForm ? <X size={14} aria-hidden="true" /> : <Plus size={14} aria-hidden="true" />}
            {showLogForm ? 'Cancel' : 'Log dose'}
          </button>
        </div>

        {showLogForm && (
          <div className="mb-3">
            <DoseLogForm
              protocol={p}
              onSubmit={(body) => addLog.mutate(body)}
              pending={addLog.isPending}
              error={logError}
            />
          </div>
        )}

        {logs.length === 0 ? (
          <p className="py-4 text-center text-sm text-tx3-body">
            No doses logged yet.
          </p>
        ) : (
          <ul className="divide-y divide-hairline">
            {logs.map((log) => (
              <li key={log.id} className="flex items-start gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-teal">{log.dose}</p>
                  {log.notes && (
                    <p className="mt-0.5 text-[13px] leading-5 text-tx3-body">
                      {log.notes}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-[12px] text-tx3-body">
                  {formatDateTime(log.taken_at)}
                </span>
                {/* Native hides this behind a long-press with no affordance. */}
                <button
                  type="button"
                  onClick={() => setConfirmLog(log.id)}
                  aria-label={`Delete dose logged ${formatDateTime(log.taken_at)}`}
                  className="tap flex shrink-0 items-center justify-center rounded-[8px] text-tx3-body hover:text-danger-text"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this protocol?"
        body="Its dose log will be deleted too. This cannot be undone."
        onConfirm={() => remove.mutate()}
        onCancel={() => setConfirmDelete(false)}
        pending={remove.isPending}
      />

      <ConfirmDialog
        open={confirmLog != null}
        title="Delete this dose entry?"
        onConfirm={() => removeLog.mutate(confirmLog)}
        onCancel={() => setConfirmLog(null)}
        pending={removeLog.isPending}
      />
    </div>
  )
}
