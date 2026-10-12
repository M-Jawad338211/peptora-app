import { Suspense } from 'react'
import Profile from '@/components/profile/Profile'
import ProfileSkeleton from '@/components/profile/ProfileSkeleton'

export const metadata = { title: 'Account settings · Peptora' }

/**
 * Account settings. The section (Profile, Security or Billing) is `?tab=` in
 * the URL and is read on the client, hence the Suspense boundary.
 */
export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Profile />
    </Suspense>
  )
}
