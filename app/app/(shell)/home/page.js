import Home from '@/components/home/Home'
import InstallPrompt from '@/components/pwa/InstallPrompt'

export const metadata = { title: 'Home · Peptora' }

export default function HomePage() {
  return (
    <>
      {/* Home only — an install banner on every screen would be nagging. */}
      <div className="mx-auto max-w-[760px]">
        <InstallPrompt />
      </div>
      <Home />
    </>
  )
}
