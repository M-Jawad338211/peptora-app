import { qk } from './keys'

/**
 * After a successful account change, refresh what the page shows.
 *
 * The session (name, phone, photo, pending email, two-factor flag, password
 * date) and the security activity list always; the two-factor status when the
 * change touched it. Awaited by the caller, so a form stays "saving" until the
 * page already shows the new state and nothing flickers back.
 */
export function refreshAccount(queryClient, { twoFactor = false } = {}) {
  const keys = [qk.session, qk.activity]
  if (twoFactor) keys.push(qk.twoFactor)
  return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
}
