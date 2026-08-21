import Link from 'next/link'
import { ArrowLeft, FlaskConical } from 'lucide-react'
import {
  fmt,
  categoryColor,
  evidenceColor,
  stackTypeColor,
  formatDoseRange,
} from '@/lib/peptide-format'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Section from './Section'
import Row, { Divider, Subheading, Body } from './Row'

/**
 * Stack/blend entry — mirrors PeptideDetail's shape, adapted for the
 * stack_documents shape: a composition ratio section (commercial_blend
 * only, never framed as a recommendation), then each component with its
 * own live reference dose ranges pulled from that peptide's own page.
 */
export default function StackDetail({ stack: st }) {
  return (
    <article className="mx-auto max-w-[760px]">
      <Link
        href="/app/encyclopedia/stacks"
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-teal no-underline"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Encyclopedia
      </Link>

      <header className="card mb-2.5 p-4">
        <h2 className="text-2xl font-extrabold text-tx">{st.name}</h2>
        {st.aliases?.length > 0 && (
          <p className="mt-1 text-[13px] text-tx3-body">{st.aliases.join(' · ')}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          <Badge label={fmt(st.stack_type)} color={stackTypeColor(st.stack_type)} />
          {st.category && <Badge label={fmt(st.category)} color={categoryColor(st.category)} />}
          <Badge label={fmt(st.evidence_level)} color={evidenceColor(st.evidence_level)} />
        </div>
      </header>

      <Section title="Overview" defaultOpen>
        <Body>{st.positioning}</Body>
        {st.rationale && (
          <>
            <Divider />
            <Subheading>Rationale</Subheading>
            <Body>{st.rationale}</Body>
          </>
        )}
      </Section>

      {st.stack_type === 'commercial_blend' && (
        <Section title="Commonly Documented Composition" defaultOpen>
          <p className="text-sm leading-6 text-tx">
            {st.components?.map((c) => c.ratio_parts).join(' : ')}
            {'  —  '}
            {st.components?.map((c) => c.peptide_name).join(' : ')}
          </p>
          {st.ratio_source_note && <Body className="mt-2">{st.ratio_source_note}</Body>}
          <Divider />
          <dl>
            <Row label="Source" value={fmt(st.ratio_source_type)} />
            {st.common_total_mg_options?.length > 0 && (
              <Row
                label="Commonly Sold As"
                value={st.common_total_mg_options.map((m) => `${m}mg`).join(', ')}
              />
            )}
          </dl>
          {st.ratio_source_urls?.length > 0 && (
            <>
              <Divider />
              <Subheading>Sources</Subheading>
              <ul className="space-y-1">
                {st.ratio_source_urls.map((u) => (
                  <li key={u}>
                    <a
                      href={u}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate text-[12px] text-teal underline decoration-hairline-strong underline-offset-2 hover:text-teal-dark"
                    >
                      {u}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Section>
      )}

      <Section title="Components" count={st.components?.length ?? 0} defaultOpen>
        <ul className="space-y-3">
          {st.components?.map((c, i) => (
            <li key={c.peptide_id} className={i > 0 ? 'border-t border-hairline pt-3' : undefined}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-tx">{c.peptide_name}</p>
                {c.ratio_parts != null && (
                  <Badge
                    label={`${c.ratio_parts} part${c.ratio_parts === 1 ? '' : 's'}`}
                    color="#00d68f"
                  />
                )}
              </div>
              {c.role && <p className="mt-1 text-[13px] leading-5 text-tx3-body">{c.role}</p>}
              {c.dose_note && (
                <p className="mt-1 text-[13px] leading-5 text-tx3-body italic">{c.dose_note}</p>
              )}
              {c.reference_dose_ranges?.map((dr, j) => (
                <div key={j} className="mt-2 ml-2">
                  <p className="text-[12px] font-semibold text-tx2">{dr.context}</p>
                  <dl>
                    <Row label="Dose" value={formatDoseRange(dr)} />
                    <Row label="Frequency" value={dr.frequency} />
                  </dl>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </Section>

      {st.caution_notes?.length > 0 && (
        <Section title="Cautions" count={st.caution_notes.length}>
          <ul className="space-y-2">
            {st.caution_notes.map((c, i) => (
              <li key={i} className="text-sm leading-6 text-tx2">
                {c}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {st.stack_references?.length > 0 && (
        <Section title="References" count={st.stack_references.length}>
          <ol className="space-y-3">
            {st.stack_references.map((ref) => (
              <li key={ref.ref_id} className="flex gap-3">
                <span className="w-7 shrink-0 font-mono text-[12px] font-bold text-teal">
                  [{ref.ref_id}]
                </span>
                <div className="min-w-0">
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] font-semibold text-tx underline decoration-hairline-strong underline-offset-2 hover:text-teal"
                    >
                      {ref.title}
                    </a>
                  ) : (
                    <p className="text-[13px] font-semibold text-tx">{ref.title}</p>
                  )}
                  <p className="mt-0.5 text-[12px] text-tx3-body">
                    {[ref.first_author, ref.year, ref.source].filter(Boolean).join(' · ')}
                  </p>
                  <div className="mt-1">
                    <Badge label={fmt(ref.type)} color="#6b7788" />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {st.disclaimer && (
        <p className="card mt-3 p-4 text-[13px] leading-6 text-tx3-body italic">{st.disclaimer}</p>
      )}

      <div className="mt-4">
        <Button href={`/app/protocols/new?stack=${st.id}`} size="lg" fullWidth>
          <FlaskConical size={16} aria-hidden="true" />
          Add as protocol
        </Button>
      </div>
    </article>
  )
}
