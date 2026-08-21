import { notFound } from 'next/navigation'
import { getStack } from '@/lib/api/server'
import StackDetail from '@/components/encyclopedia/StackDetail'

export async function generateMetadata({ params }) {
  const { id } = await params
  const stack = await getStack(id).catch(() => null)
  if (!stack) return { title: 'Stack not found · Peptora' }

  return {
    title: `${stack.name} · Peptora`,
    description: stack.positioning,
  }
}

export default async function StackPage({ params }) {
  const { id } = await params
  const stack = await getStack(id)

  if (!stack) notFound()

  return <StackDetail stack={stack} />
}
