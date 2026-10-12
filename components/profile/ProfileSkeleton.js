import Skeleton from '@/components/ui/Skeleton'

/** The settings page while it loads: the navigation, then a few cards. */
export default function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-[560px] lg:grid lg:max-w-[820px] lg:grid-cols-[176px_minmax(0,1fr)] lg:gap-8">
      <Skeleton className="mb-4 h-11 lg:mb-0 lg:h-32" />
      <div className="space-y-2.5">
        <Skeleton className="h-32" />
        <Skeleton className="h-52" />
        <Skeleton className="h-40" />
      </div>
    </div>
  )
}
