import EncyclopediaToggle from '@/components/encyclopedia/EncyclopediaToggle'

export default function EncyclopediaLayout({ children }) {
  return (
    <div>
      <EncyclopediaToggle />
      {children}
    </div>
  )
}
