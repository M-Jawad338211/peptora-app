import Skeleton from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-4 py-2">
      <Skeleton className="h-7 w-48" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-40" />
    </div>
  )
}
