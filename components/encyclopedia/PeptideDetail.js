import Link from 'next/link'
import { ArrowLeft, FlaskConical, ExternalLink } from 'lucide-react'
import {
  fmt,
  categoryColor,
  evidenceColor,
  fdaColor,
  formatDoseRange,
  referenceHref,
} from '@/lib/peptide-format'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Section from './Section'
import Row, { Divider, Subheading, Body } from './Row'
import ClaimList from './ClaimList'

/**
 * Full peptide entry, ported from the native DetailView
 * (peptora-android/app/(tabs)/encyclopedia.js:267-678).
 *
 * Section order and content match native. Everything except the collapsible
 * headers renders on the server.
 */
export default function PeptideDetail({ peptide: p }) {
  const hl = p.half_life

  return (
    <article className="mx-auto max-w-[760px]">
      <Link
        href="/app/encyclopedia"
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-teal no-underline"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Encyclopedia
      </Link>

      {/* Header */}
      <header className="card mb-2.5 p-4">
        <h1 className="text-2xl font-extrabold text-tx">{p.name}</h1>
        {p.aliases?.length > 0 && (
          <p className="mt-1 text-[13px] text-tx3-body">
            {p.aliases.join(' · ')}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          <Badge label={fmt(p.category)} color={categoryColor(p.category)} />
          <Badge
            label={fmt(p.evidence_level)}
            color={evidenceColor(p.evidence_level)}
          />
          <Badge label={fmt(p.fda_status)} color={fdaColor(p.fda_status)} />
          {p.research_only && <Badge label="Research Only" color="#ffd32a" />}
        </div>

        {p.tags?.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {p.tags.map((t) => (
              <li
                key={t}
                className="rounded border border-hairline bg-white/5 px-2 py-[3px] text-[11px] text-tx2"
              >
                {t}
              </li>
            ))}
          </ul>
        )}
      </header>

      <Section title="Overview" defaultOpen>
        <Body>{p.summary}</Body>
        {p.description && (
          <>
            <Divider />
            <Body>{p.description}</Body>
          </>
        )}
        {p.mechanism_of_action && (
          <>
            <Divider />
            <Subheading>Mechanism of Action</Subheading>
            <Body>{p.mechanism_of_action}</Body>
          </>
        )}
      </Section>

      {(p.molecular_weight || p.molecular_formula || p.cas_number || p.sequence) && (
        <Section title="Chemistry">
          <dl>
            <Row
              label="Molecular Weight"
              value={p.molecular_weight ? `${p.molecular_weight} Da` : null}
            />
            <Row label="Molecular Formula" value={p.molecular_formula} />
            <Row label="CAS Number" value={p.cas_number} />
            <Row label="PubChem CID" value={p.pubchem_cid} />
          </dl>
          {p.sequence && (
            <>
              <p className="mt-2 mb-1 text-[13px] text-tx2">Sequence</p>
              <p className="font-mono text-[13px] leading-6 tracking-[1px] break-all text-teal">
                {p.sequence}
              </p>
              <dl>
                <Row label="Sequence Type" value={fmt(p.sequence_type)} />
              </dl>
            </>
          )}
        </Section>
      )}

      <Section title="Pharmacology">
        {hl && (
          <>
            <Subheading>Half-Life</Subheading>
            <dl>
              <Row
                label="Value"
                value={
                  hl.value != null
                    ? `${hl.value} ${hl.unit || ''}`.trim()
                    : hl.unit
                      ? `Unknown (${hl.unit})`
                      : null
                }
              />
              <Row label="Estimated" value={hl.isEstimated} />
            </dl>
            {hl.note && <Body className="mt-1.5">{hl.note}</Body>}
            <Divider />
          </>
        )}
        <dl>
          {p.routes?.length > 0 && (
            <Row label="Routes" value={p.routes.map(fmt).join(', ')} />
          )}
          <Row
            label="Default Dose Unit"
            value={p.default_dose_unit?.toUpperCase()}
          />
        </dl>
      </Section>

      <Section title="Evidence">
        <dl>
          <Row label="Evidence Level" value={fmt(p.evidence_level)} />
          <Row label="Human Trials" value={p.human_trials} />
          {/* 0 is meaningful here and must not be hidden. */}
          <Row label="Clinical Trials" value={p.clinical_trials_count} />
        </dl>
        {p.evidence_note && (
          <>
            <Divider />
            <Body>{p.evidence_note}</Body>
          </>
        )}
      </Section>

      <Section title="Regulatory">
        <dl>
          <Row label="FDA Status" value={fmt(p.fda_status)} />
        </dl>
        {p.fda_status_note && <Body className="mb-2.5">{p.fda_status_note}</Body>}

        {p.compounding_status && (
          <>
            <Divider />
            <dl>
              <Row label="Compounding Status" value={fmt(p.compounding_status)} />
            </dl>
            {p.compounding_note && (
              <Body className="mb-2.5">{p.compounding_note}</Body>
            )}
          </>
        )}

        {p.wada_status && (
          <>
            <Divider />
            <dl>
              <Row label="WADA Status" value={fmt(p.wada_status)} />
            </dl>
          </>
        )}

        <Divider />
        <dl>
          <Row label="Scheduled / Controlled" value={p.scheduled_controlled} />
          <Row label="Research Only" value={p.research_only} />
        </dl>
      </Section>

      {p.benefits?.length > 0 && (
        <Section title="Benefits" count={p.benefits.length}>
          <ClaimList items={p.benefits} />
        </Section>
      )}
      {p.risks?.length > 0 && (
        <Section title="Risks" count={p.risks.length}>
          <ClaimList items={p.risks} />
        </Section>
      )}
      {p.side_effects?.length > 0 && (
        <Section title="Side Effects" count={p.side_effects.length}>
          <ClaimList items={p.side_effects} />
        </Section>
      )}
      {p.contraindications?.length > 0 && (
        <Section title="Contraindications" count={p.contraindications.length}>
          <ClaimList items={p.contraindications} />
        </Section>
      )}
      {p.interactions?.length > 0 && (
        <Section title="Interactions" count={p.interactions.length}>
          <ClaimList items={p.interactions} />
        </Section>
      )}

      {p.dose_ranges?.length > 0 && (
        <Section title="Studied Dose Ranges" count={p.dose_ranges.length}>
          <ul className="space-y-3">
            {p.dose_ranges.map((dr, i) => (
              <li
                key={dr.id}
                className={i > 0 ? 'border-t border-hairline pt-3' : undefined}
              >
                <p className="text-sm font-semibold text-tx">{dr.context}</p>
                <dl>
                  <Row label="Dose" value={formatDoseRange(dr)} />
                  <Row label="Route" value={fmt(dr.route)} />
                  <Row label="Frequency" value={dr.frequency} />
                </dl>
                {dr.note && (
                  <p className="mt-1 text-[13px] leading-5 text-tx3-body">
                    {dr.note}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12px] leading-5 text-tx3-body italic">
            Studied / reported ranges — not a recommendation.
          </p>
        </Section>
      )}

      {p.protocols?.length > 0 && (
        <Section title="Protocols" count={p.protocols.length}>
          <ul className="space-y-3">
            {p.protocols.map((proto, i) => (
              <li
                key={proto.id}
                className={i > 0 ? 'border-t border-hairline pt-3' : undefined}
              >
                <p className="text-sm font-semibold text-tx">{proto.name}</p>
                {proto.phase && (
                  <p className="mt-0.5 text-[12px] text-tx3-body">
                    Phase: {fmt(proto.phase)}
                  </p>
                )}
                {proto.description && (
                  <p className="mt-1 text-[13px] leading-5 text-tx3-body">
                    {proto.description}
                  </p>
                )}
                <dl>
                  <Row
                    label="Duration"
                    value={
                      proto.duration_weeks
                        ? proto.duration_weeks.min === proto.duration_weeks.max
                          ? `${proto.duration_weeks.min} weeks`
                          : `${proto.duration_weeks.min}–${proto.duration_weeks.max} weeks`
                        : null
                    }
                  />
                  <Row
                    label="Dosing"
                    value={
                      proto.dosing
                        ? [
                            proto.dosing.frequency,
                            proto.dosing.route ? fmt(proto.dosing.route) : null,
                            proto.dosing.unit ? `(${proto.dosing.unit})` : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')
                        : null
                    }
                  />
                </dl>
                {proto.cycling_notes && (
                  <p className="mt-1 text-[13px] leading-5 text-tx3-body">
                    {proto.cycling_notes}
                  </p>
                )}
                {proto.disclaimer && (
                  <p className="mt-1.5 text-[12px] leading-5 text-tx3-body italic">
                    {proto.disclaimer}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {(p.reconstitution || p.storage) && (
        <Section title="Reconstitution & Storage">
          {p.reconstitution?.note && (
            <>
              <Subheading>Reconstitution</Subheading>
              <Body>{p.reconstitution.note}</Body>
              <dl>
                <Row
                  label="Light Sensitive"
                  value={p.reconstitution.lightSensitive}
                />
              </dl>
              <Divider />
            </>
          )}
          {p.storage && (
            <>
              <Subheading>Storage</Subheading>
              {p.storage.lyophilized && (
                <div className="mb-2">
                  <p className="text-sm font-semibold text-tx">Lyophilized</p>
                  <dl>
                    <Row
                      label="Temp"
                      value={
                        p.storage.lyophilized.tempC
                          ? `${p.storage.lyophilized.tempC}°C`
                          : null
                      }
                    />
                  </dl>
                  <p className="text-[13px] leading-5 text-tx3-body">
                    {p.storage.lyophilized.stability}
                  </p>
                </div>
              )}
              {p.storage.reconstituted && (
                <div className="mb-2">
                  <p className="text-sm font-semibold text-tx">Reconstituted</p>
                  <dl>
                    <Row
                      label="Temp"
                      value={
                        p.storage.reconstituted.tempC
                          ? `${p.storage.reconstituted.tempC}°C`
                          : null
                      }
                    />
                  </dl>
                  <p className="text-[13px] leading-5 text-tx3-body">
                    {p.storage.reconstituted.stability}
                  </p>
                </div>
              )}
              <dl>
                <Row label="Light Sensitive" value={p.storage.lightSensitive} />
              </dl>
            </>
          )}
        </Section>
      )}

      {p.references?.length > 0 && (
        <Section title="References" count={p.references.length}>
          <ol className="space-y-3">
            {p.references.map((ref) => {
              const href = referenceHref(ref)
              const meta = [ref.first_author, ref.year, ref.source]
                .filter(Boolean)
                .join(' · ')
              return (
                <li key={ref.ref_id} className="flex gap-3">
                  <span className="w-7 shrink-0 font-mono text-[12px] font-bold text-teal">
                    [{ref.ref_id}]
                  </span>
                  <div className="min-w-0">
                    {/* Native renders PMIDs as plain text and never uses
                        ref.doi or ref.url, so a citation cannot be followed. */}
                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-1 text-[13px] font-semibold text-tx underline decoration-hairline-strong underline-offset-2 hover:text-teal"
                      >
                        {ref.title}
                        <ExternalLink
                          size={12}
                          aria-hidden="true"
                          className="mt-1 shrink-0"
                        />
                      </a>
                    ) : (
                      <p className="text-[13px] font-semibold text-tx">
                        {ref.title}
                      </p>
                    )}
                    {(meta || ref.pmid) && (
                      <p className="mt-0.5 text-[12px] text-tx3-body">
                        {meta}
                        {ref.pmid ? `  ·  PMID ${ref.pmid}` : ''}
                      </p>
                    )}
                    <div className="mt-1">
                      <Badge label={fmt(ref.type)} color="#6b7788" />
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </Section>
      )}

      {p.disclaimer && (
        <p className="card mt-3 p-4 text-[13px] leading-6 text-tx3-body italic">
          {p.disclaimer}
        </p>
      )}

      <div className="mt-4">
        {/* Native calls onAddProtocol(p.id) but the handler drops the id and
            pushes the protocol LIST, so the peptide is never carried over. */}
        <Button href={`/app/protocols/new?peptide=${p.id}`} size="lg" fullWidth>
          <FlaskConical size={16} aria-hidden="true" />
          Add as protocol
        </Button>
      </div>
    </article>
  )
}
