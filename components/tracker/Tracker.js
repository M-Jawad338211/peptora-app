'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChartLine, Plus, Trash2 } from 'lucide-react'
import { tracker as trackerApi, peptides as peptidesApi } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { formatDateTime } from '@/lib/format'
import AuthGate from '@/components/auth/AuthGate'
import Button from '@/components/ui/Button'
import Field from '@/components/ui/Field'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import PeptideSelect from '@/components/calculator/PeptideSelect'

function LogList() {
  const queryClient = useQueryClient()
  const [confirmId, setConfirmId] = useState(null)

  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: qk.trackerLogs,
    queryFn: trackerApi.listLogs,
  })

  const remove = useMutation({
    mutationFn: (id) => trackerApi.removeLog(id),
    onSuccess: () => {
      setConfirmId(null)
      queryClient.invalidateQueries({ queryKey: qk.trackerLogs })
      // A tracker log counts toward the protocol stats summary too.
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
    },
  })

  if (isPending) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load your log"
        message={error.message}
        onRetry={() => refetch()}
        pending={isFetching}
      />
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={ChartLine}
        title="No entries yet"
        body="Log your first dose above to start building a history."
      />
    )
  }

  return (
    <>
      <p className="eyebrow mb-2">Log ({data.length} entries)</p>
      <ul className="space-y-2">
        {data.map((log) => (
          <li key={log.id} className="card flex items-start gap-3 p-3.5">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-tx">{log.peptide_name}</p>
              <p className="text-sm text-teal">{log.dose}</p>
              {log.notes && (
                <p className="mt-1 text-[13px] leading-5 text-tx3-body">
                  {log.notes}
                </p>
              )}
            </div>
            <span className="shrink-0 text-[12px] text-tx3-body">
              {formatDateTime(log.taken_at)}
            </span>
            <button
              type="button"
              onClick={() => setConfirmId(log.id)}
              aria-label={`Delete ${log.peptide_name} entry`}
              className="tap flex shrink-0 items-center justify-center rounded-[8px] text-tx3-body hover:text-danger"
            >
              <Trash2 size={14} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={confirmId != null}
        title="Delete this entry?"
        onConfirm={() => remove.mutate(confirmId)}
        onCancel={() => setConfirmId(null)}
        pending={remove.isPending}
      />
    </>
  )
}

function LogForm() {
  const queryClient = useQueryClient()
  const [peptideId, setPeptideId] = useState(null)
  const [customName, setCustomName] = useState('')
  const [dose, setDose] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const { data: list = [] } = useQuery({
    queryKey: qk.peptides,
    queryFn: peptidesApi.list,
    staleTime: 10 * 60_000,
  })
  const selected = list.find((p) => p.id === peptideId)
  const name = selected?.name || customName.trim()

  const add = useMutation({
    mutationFn: (body) => trackerApi.addLog(body),
    onSuccess: () => {
      setDose('')
      setNotes('')
      setError('')
      queryClient.invalidateQueries({ queryKey: qk.trackerLogs })
      queryClient.invalidateQueries({ queryKey: ['protocols'] })
    },
    onError: (err) => setError(err.message || 'Could not save the entry.'),
  })

  const submit = (e) => {
    e.preventDefault()
    if (!name) {
      setError('Choose a peptide or type a name.')
      return
    }
    if (!dose.trim()) {
      setError('Enter the dose you took.')
      return
    }
    add.mutate({ peptide_name: name, dose: dose.trim(), notes: notes.trim() || null })
  }

  return (
    <form onSubmit={submit} className="card mb-5 space-y-4 p-4" noValidate>
      {/* Native drives this from a separate hardcoded 25-item list that is
          guaranteed to drift from the API-backed encyclopedia. */}
      <PeptideSelect value={peptideId} onChange={setPeptideId} />

      {!peptideId && (
        <Field
          label="Or type a name"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="e.g. Custom blend"
        />
      )}

      <Field
        label="Dose"
        value={dose}
        onChange={(e) => setDose(e.target.value)}
        placeholder="e.g. 250 mcg"
      />

      <Field
        as="textarea"
        label="Notes"
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional"
        inputClassName="resize-y"
      />

      {error && (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}

      <Button type="submit" disabled={add.isPending} fullWidth>
        <Plus size={15} aria-hidden="true" />
        {add.isPending ? 'Adding…' : 'Add log entry'}
      </Button>
    </form>
  )
}

export default function Tracker() {
  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="mb-1 text-2xl font-bold text-tx">Cycle tracker</h1>
      <p className="mb-5 text-sm text-tx3-body">
        Log each dose and review your history.
      </p>

      <AuthGate
        title="Log in to use the Cycle Tracker"
        subtitle="Your dose history is saved to your account."
      >
        <LogForm />
        <LogList />
      </AuthGate>
    </div>
  )
}
