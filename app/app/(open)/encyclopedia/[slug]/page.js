import { notFound } from 'next/navigation'
import { getPeptide } from '@/lib/api/server'
import PeptideDetail from '@/components/encyclopedia/PeptideDetail'

/**
 * These pages render per-request, not statically: the surrounding (shell)
 * layout reads the session cookie, which opts the whole subtree out of static
 * generation. generateStaticParams was tried here and produced nothing while
 * adding ~40s to the build.
 *
 * The peptide data is still cached for an hour by the fetch in lib/api/server.js,
 * so the API is not hit per request — only the HTML is re-rendered, and the
 * markup is still fully server-rendered for SEO.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params
  const peptide = await getPeptide(slug).catch(() => null)
  if (!peptide) return { title: 'Peptide not found · Peptora' }

  return {
    title: `${peptide.name} · Peptora`,
    description: peptide.summary,
  }
}

export default async function PeptidePage({ params }) {
  const { slug } = await params
  const peptide = await getPeptide(slug)

  // Native renders a placeholder stub for unknown slugs, which produces
  // endless indexable pages of filler. A real 404 is correct.
  if (!peptide) notFound()

  return <PeptideDetail peptide={peptide} />
}
