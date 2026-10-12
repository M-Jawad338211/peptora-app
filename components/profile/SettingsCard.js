/**
 * One block of the settings page: a card with a title, an optional sentence
 * under it, and the content. Titles are h2 at the size the other cards in the
 * app use (DeleteAccount, ClaimForm).
 */
export default function SettingsCard({ title, description, aside, children, className = '' }) {
  return (
    <section className={`card p-4 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-bold text-tx">{title}</h2>
          {description && (
            <p className="mt-1 text-[13px] leading-5 text-tx3-body">{description}</p>
          )}
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}
