/**
 * Small pure helpers for the account settings screens. Nothing here touches
 * the DOM or the network, so every one of them is covered by
 * lib/__tests__/account.test.js.
 */
import { ApiError } from './api/client'

// ── Sections of the settings page ─────────────────────────────────────────

export const ACCOUNT_TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'security', label: 'Security' },
  { key: 'billing', label: 'Billing' },
]

/** The section named by `?tab=`; anything unknown is the first one. */
export function tabFromParam(value) {
  return ACCOUNT_TABS.some((t) => t.key === value) ? value : ACCOUNT_TABS[0].key
}

/** The URL of a section. The first one is the plain /app/profile. */
export function tabHref(key) {
  return key === ACCOUNT_TABS[0].key ? '/app/profile' : `/app/profile?tab=${key}`
}

// ── Input ─────────────────────────────────────────────────────────────────

/** Digits only, at most `max` of them: what a 6-digit code field keeps. */
export function onlyDigits(value, max = 6) {
  return String(value ?? '').replace(/\D/g, '').slice(0, max)
}

/** A cheap shape check so an obvious typo is caught before a request is spent
 *  on it. The server is the authority on what a valid address is. */
export function looksLikeEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim())
}

/** The number as the server stores it: spaces, dashes, dots and brackets gone. */
export function normalisePhone(value) {
  return String(value ?? '').replace(/[\s\-.()]/g, '')
}

/**
 * The server's rule for a contact number, so a typo is caught on the field it
 * is in: "+" and 7 to 15 digits, not starting with 0. An empty value is fine
 * (it clears the number). It is never verified, only stored.
 */
export function phoneProblem(value) {
  if (!String(value ?? '').trim()) return ''
  return /^\+[1-9]\d{6,14}$/.test(normalisePhone(value))
    ? ''
    : 'Enter the number in international format, for example +14155550123.'
}

/**
 * The checks the server would make on a new password, plus the repeat field,
 * which only the client knows about. Same sentences as the server, so a user
 * reads the same words whichever side catches it. Returns null when it is fine,
 * else {field: 'current' | 'next' | 'repeat', message}.
 */
export function passwordProblem({ current, next, repeat }) {
  if (!current) return { field: 'current', message: 'Enter your current password.' }
  if (next.length < 8) return { field: 'next', message: 'Password must be at least 8 characters' }
  // bcrypt's limit, counted in bytes the way the server counts it.
  if (new TextEncoder().encode(next).length > 72) {
    return { field: 'next', message: 'Password must be 72 characters or fewer' }
  }
  if (next === current) {
    return { field: 'next', message: 'Choose a password you are not already using.' }
  }
  if (next !== repeat) return { field: 'repeat', message: 'The two new passwords do not match.' }
  return null
}

// ── Photo ─────────────────────────────────────────────────────────────────

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Whether a chosen file is worth uploading, with the server's own wording.
 * Checked here only to fail fast: the server decides from the bytes. A file
 * with no reported type is let through for that reason.
 */
export function avatarFileProblem(file) {
  if (!file) return 'Choose an image.'
  if (file.type && !AVATAR_TYPES.includes(file.type)) return 'Upload a JPG, PNG or WebP image.'
  if (file.size > AVATAR_MAX_BYTES) return 'That image is larger than 5 MB.'
  return ''
}

// ── Errors ────────────────────────────────────────────────────────────────

/** A wrong password on a signed-in request: 403, never 401. */
export const isWrongPassword = (err) => err instanceof ApiError && err.status === 403

/** two_factor_invalid or two_factor_locked: the problem is the code. */
export const isSecondFactorError = (err) =>
  err instanceof ApiError && typeof err.code === 'string' && err.code.startsWith('two_factor_')

/**
 * The sentence to show for a failed request. The API's `detail` is already
 * written for the user and is shown as it is. Two answers are not: the rate
 * limiter's `{error: "Rate limit exceeded: 5 per 1 minute"}`, and a request
 * that never reached the server.
 */
export function errorText(err, fallback = 'Something went wrong. Try again.') {
  if (err instanceof ApiError) {
    if (err.status === 429 && typeof err.data?.detail !== 'string') {
      return 'Too many attempts. Wait a minute and try again.'
    }
    return err.message || fallback
  }
  return 'Could not reach Peptora. Check your connection and try again.'
}

// ── Wording ───────────────────────────────────────────────────────────────

/** "1 recovery code", "0 recovery codes". */
export function countLabel(n, singular, plural = `${singular}s`) {
  return `${n} ${n === 1 ? singular : plural}`
}

const PLATFORMS = { web: 'Web', android: 'Android app', ios: 'iPhone app' }

/** The client that did something, as the activity list names it. */
export function platformLabel(platform) {
  const key = String(platform ?? '').trim().toLowerCase()
  if (!key) return ''
  return PLATFORMS[key] ?? key.charAt(0).toUpperCase() + key.slice(1, 30)
}

/** "8 Oct, 9:55 PM", with the year when it is not this one. */
export function formatWhen(value, { now = new Date(), locale } = {}) {
  const d = value instanceof Date ? value : new Date(value)
  if (!value || Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    ...(d.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ── Billing history ───────────────────────────────────────────────────────

const STATUS_COLOR = {
  paid: '#00d68f',
  active: '#00d68f',
  pending: '#ffd32a',
  // Amber, not red: a payment we could not confirm is something to fix, not
  // an alarm (the same reasoning as the library's "Not approved" pill).
  rejected: '#ff9f43',
  refunded: '#4a9eff',
  cancelled: '#9fb0c5',
  expired: '#9fb0c5',
}

/** The pill colour for a billing status. The words come from `status_label`. */
export function statusColor(status) {
  return STATUS_COLOR[status] ?? '#9fb0c5'
}

/**
 * An amount for the history list. App Store subscriptions have none (Apple
 * bills them), which is an empty string, not "0".
 */
export function formatMoney(amount, currency, locale) {
  if (amount == null || amount === '' || !Number.isFinite(Number(amount))) return ''
  const n = Number(amount)
  const code = typeof currency === 'string' ? currency.trim().toUpperCase() : ''
  if (!code) return n.toFixed(2)
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(n)
  } catch {
    // Not an ISO currency code.
    return `${code} ${n.toFixed(2)}`
  }
}

// ── Recovery codes ────────────────────────────────────────────────────────

/**
 * The text saved by "Download". Plain punctuation, and the date as YYYY-MM-DD
 * so the file reads the same wherever it is opened.
 */
export function recoveryCodesText({ codes, email, createdAt = new Date() }) {
  const day = createdAt.toISOString().slice(0, 10)
  return [
    'Peptora recovery codes',
    ...(email ? [`Account: ${email}`] : []),
    `Created: ${day}`,
    '',
    'Each code works once. Use one in place of the 6-digit code when you sign in',
    'without your authenticator app. Keep this file somewhere private.',
    '',
    ...codes.map((code, i) => `${String(i + 1).padStart(2, ' ')}. ${code}`),
    '',
  ].join('\n')
}
