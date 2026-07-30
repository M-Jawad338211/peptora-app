import Button from './Button'

/**
 * The illustrated empty state, modelled on the one good example in the native
 * app (peptora-android/app/(tabs)/protocols.js:431-440). Native's other
 * screens fall back to a bare centred string; this is used everywhere here.
 */
export default function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <Icon
          size={52}
          strokeWidth={1.4}
          aria-hidden="true"
          className="mb-4 text-tx3"
        />
      )}
      <h2 className="mb-2 text-xl font-bold text-tx">{title}</h2>
      {body && (
        <p className="mb-6 max-w-[38ch] text-sm leading-6 text-tx3-body">
          {body}
        </p>
      )}
      {action && (
        <Button href={action.href} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
