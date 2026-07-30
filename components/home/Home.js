'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  FlaskConical,
  BookOpen,
  Calculator,
  ChartLine,
  CirclePlay,
  TrendingUp,
  ChevronRight,
} from 'lucide-react'
import { protocols as protocolsApi, tracker as trackerApi } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { useSession } from '@/lib/auth/session'
import { formatDateTime } from '@/lib/format'
import Button from '@/components/ui/Button'
import Skeleton from '@/components/ui/Skeleton'

function StatCard({ label, value, accent, icon: Icon, pending }) {
  return (
    <div
      className="rounded-[12px] border p-3"
      style={{ borderColor: `${accent}33`, backgroundColor: `${accent}0d` }}
    >
      <Icon size={16} aria-hidden="true" style={{ color: accent }} />
      {pending ? (
        <Skeleton className="mt-1.5 h-6 w-10" />
      ) : (
        <p className="mt-1.5 text-[22px] font-extrabold" style={{ color: accent }}>
          {value}
        </p>
      )}
      <p className="text-[11px] font-semibold text-tx2 uppercase">{label}</p>
    </div>
  )
}

function QuickAction({ href, icon: Icon, label, desc, accent }) {
  return (
    <Link
      href={href}
      className="card flex items-center gap-3 p-3.5 no-underline transition-colors hover:border-hairline-strong"
    >
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-[12px] border"
        style={{ backgroundColor: `${accent}18`, borderColor: `${accent}40` }}
      >
        <Icon size={19} aria-hidden="true" style={{ color: accent }} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold text-tx">{label}</span>
        <span className="block text-[13px] text-tx3-body">{desc}</span>
      </span>
      <ChevronRight size={17} aria-hidden="true" className="shrink-0 text-tx3-body" />
    </Link>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Home() {
  const { user } = useSession()

  const stats = useQuery({
    queryKey: qk.protocolStats,
    queryFn: protocolsApi.stats,
    enabled: !!user,
  })

  // Native reads dose_logs off the protocol LIST, but the list serializer has
  // no such field — only the detail endpoint does — so its "Recent Logs"
  // section is permanently empty. The tracker feed is the right source.
  const logs = useQuery({
    queryKey: qk.trackerLogs,
    queryFn: trackerApi.listLogs,
    enabled: !!user,
  })

  const firstName = user?.full_name?.split(' ')[0]

  return (
    <div className="mx-auto max-w-[760px]">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold text-tx">
            {greeting()}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-[13px] text-tx3-body">
            {user ? "Here's your protocol overview" : 'Peptide research tools'}
          </p>
        </div>
        {user && (
          <span
            aria-hidden="true"
            className="flex size-[42px] shrink-0 items-center justify-center rounded-full bg-teal/15 text-base font-bold text-teal"
          >
            {(user.email?.[0] ?? 'P').toUpperCase()}
          </span>
        )}
      </header>

      {user && (
        <>
          {stats.isError ? (
            // Native has no error branch here, so a failure renders three
            // "—" cards indistinguishable from "you have zero protocols".
            <p className="mb-6 rounded-[10px] border border-danger/25 bg-danger/8 p-3 text-[13px] text-danger">
              Could not load your stats.
            </p>
          ) : (
            <div className="mb-6 grid grid-cols-3 gap-2.5">
              <StatCard
                label="Active"
                value={stats.data?.active_protocols ?? 0}
                accent="#00d68f"
                icon={CirclePlay}
                pending={stats.isPending}
              />
              <StatCard
                label="Total"
                value={stats.data?.total_protocols ?? 0}
                accent="#4a9eff"
                icon={FlaskConical}
                pending={stats.isPending}
              />
              <StatCard
                label="This week"
                value={stats.data?.logs_this_week ?? 0}
                accent="#ffd32a"
                icon={TrendingUp}
                pending={stats.isPending}
              />
            </div>
          )}
        </>
      )}

      <h2 className="eyebrow mb-2.5">Quick actions</h2>
      <div className="mb-6 space-y-2">
        <QuickAction
          href="/app/calculator"
          icon={Calculator}
          label="Dose calculator"
          desc="Reconstitution and syringe dosing"
          accent="#00d68f"
        />
        <QuickAction
          href="/app/protocols"
          icon={FlaskConical}
          label="Protocols"
          desc="View and manage your peptide protocols"
          accent="#4a9eff"
        />
        <QuickAction
          href="/app/tracker"
          icon={ChartLine}
          label="Cycle tracker"
          desc="Log doses and review your history"
          accent="#ffd32a"
        />
        <QuickAction
          href="/app/encyclopedia"
          icon={BookOpen}
          label="Encyclopedia"
          desc="Browse the peptide knowledge base"
          accent="#a78bfa"
        />
      </div>

      {user && logs.data?.length > 0 && (
        <>
          <h2 className="eyebrow mb-2.5">Recent logs</h2>
          <ul className="card mb-6 divide-y divide-hairline px-4">
            {logs.data.slice(0, 5).map((log) => (
              <li key={log.id} className="flex items-center gap-2.5 py-2.5">
                <span
                  aria-hidden="true"
                  className="size-[7px] shrink-0 rounded-full bg-teal"
                />
                <span className="min-w-0 flex-1 truncate text-sm text-tx">
                  {log.peptide_name}
                </span>
                <span className="shrink-0 text-sm text-teal">{log.dose}</span>
                <span className="shrink-0 text-[12px] text-tx3-body">
                  {formatDateTime(log.taken_at)}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {!user && (
        <div className="card mb-6 p-5 text-center">
          <FlaskConical
            size={36}
            strokeWidth={1.4}
            aria-hidden="true"
            className="mx-auto mb-3 text-teal"
          />
          <h2 className="mb-1.5 text-lg font-bold text-tx">
            Track your peptide protocols
          </h2>
          <p className="mb-5 text-sm leading-6 text-tx3-body">
            Create an account to save protocols, log doses and keep your
            calculation history. The calculator and encyclopedia are free to
            use without one.
          </p>
          <Button href="/app/auth/signup" fullWidth>
            Get started
          </Button>
          <p className="mt-3 text-[13px] text-tx3-body">
            Already have an account?{' '}
            <Link href="/app/auth/login" className="text-teal no-underline">
              Log in
            </Link>
          </p>
        </div>
      )}

      <p className="text-[11px] leading-4 text-tx3-body italic">
        Peptora is for research and educational use only. Nothing here
        constitutes medical advice.
      </p>
    </div>
  )
}
