'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { FlaskConical, Plus } from 'lucide-react'
import { protocols as protocolsApi } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import AuthGate from '@/components/auth/AuthGate'
import ProtocolCard from './ProtocolCard'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'

function List() {
  const { data, isPending, error, refetch, isFetching } = useQuery({
    queryKey: qk.protocols,
    queryFn: protocolsApi.list,
  })

  if (isPending) {
    return (
      <div className="space-y-2.5">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="Could not load protocols"
        message={error.message}
        onRetry={() => refetch()}
        pending={isFetching}
      />
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={FlaskConical}
        title="No protocols yet"
        body="Save a dose calculation as a protocol to track it over time and log every dose."
        action={{ label: 'Create first protocol', href: '/app/protocols/new' }}
      />
    )
  }

  return (
    <ul className="space-y-2.5">
      {data.map((p) => (
        <li key={p.id}>
          <ProtocolCard protocol={p} />
        </li>
      ))}
    </ul>
  )
}

export default function ProtocolsList() {
  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-tx">Protocols</h1>
        <Link
          href="/app/protocols/new"
          className="tap inline-flex items-center gap-1.5 rounded-[20px] bg-teal px-4 text-[13px] font-bold text-on-teal no-underline"
        >
          <Plus size={15} aria-hidden="true" />
          New
        </Link>
      </div>

      <AuthGate
        title="Log in to use Protocols"
        subtitle="Protocols save your regimen and let you log every dose."
      >
        <List />
      </AuthGate>
    </div>
  )
}
