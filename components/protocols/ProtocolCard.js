import Link from 'next/link'
import {
  CirclePlay,
  CirclePause,
  CircleCheck,
  Clock,
  FlaskConical,
  Syringe,
  ChevronRight,
} from 'lucide-react'
import { formatDoseFromMcg, formatDate } from '@/lib/format'

export const STATUS_META = {
  active: { label: 'Active', color: '#00d68f', Icon: CirclePlay },
  paused: { label: 'Paused', color: '#ffd32a', Icon: CirclePause },
  completed: { label: 'Completed', color: '#6b7788', Icon: CircleCheck },
}

function Chip({ icon: Icon, children }) {
  if (!children) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-[6px] bg-white/5 px-2 py-1 text-[11px] text-tx3-body">
      <Icon size={12} aria-hidden="true" />
      {children}
    </span>
  )
}

export default function ProtocolCard({ protocol: p }) {
  // Native does `status?.charAt(0).toUpperCase() + status?.slice(1)`, which
  // renders the literal "undefinedundefined" when status is null.
  const status = STATUS_META[p.status] ?? {
    label: 'Unknown',
    color: '#6b7788',
    Icon: CircleCheck,
  }
  const StatusIcon = status.Icon

  const title = p.label || p.peptide_name || 'Untitled protocol'
  const subtitle = p.peptide_name && p.label ? p.peptide_name : null

  return (
    <Link
      href={`/app/protocols/${p.id}`}
      className="card flex items-center gap-3 p-4 no-underline transition-colors hover:border-hairline-strong"
    >
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="text-[15px] font-bold text-tx">{title}</span>
          {/* Icon + text, never colour alone. */}
          <span
            className="inline-flex items-center gap-1 rounded-[20px] border px-2 py-0.5 text-[10px] font-bold"
            style={{
              color: status.color,
              backgroundColor: `${status.color}22`,
              borderColor: `${status.color}55`,
            }}
          >
            <StatusIcon size={11} aria-hidden="true" />
            {status.label}
          </span>
        </div>

        {subtitle && (
          <p className="mb-2 text-[12px] text-tx3-body">{subtitle}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <Chip icon={Clock}>{p.frequency}</Chip>
          <Chip icon={FlaskConical}>{p.vial_mg} mg vial</Chip>
          {/* target_dose_mcg is always micrograms while unit is a display
              preference — native prints them together, so a 5 mg dose shows
              as "5000 mg/dose". */}
          <Chip icon={Syringe}>
            {formatDoseFromMcg(p.target_dose_mcg, p.unit)}/dose
          </Chip>
        </div>

        <p className="mt-2 text-[11px] text-tx3-body">
          {p.start_date
            ? `Started ${formatDate(p.start_date)}`
            : `Created ${formatDate(p.created_at)}`}
        </p>
      </div>

      <ChevronRight
        size={18}
        aria-hidden="true"
        className="shrink-0 text-tx3-body"
      />
    </Link>
  )
}
