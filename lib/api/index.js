import { get, post, put, patch, del, postFile, apiUrl } from './client'

export { ApiError } from './client'

/**
 * Endpoint surface, mirroring peptora-android/src/api/index.js minus the AI
 * module (no AI on web).
 */

export const auth = {
  // Returns 201 {user, message, requires_verification: true} and sets NO
  // session — the user is not logged in until the OTP is verified.
  register: ({ email, password, confirmPassword, fullName, deviceFingerprint }) =>
    post('/auth/register', {
      email: email.trim().toLowerCase(),
      password,
      confirm_password: confirmPassword,
      full_name: fullName,
      device_fingerprint: deviceFingerprint,
    }),

  // Two shapes: a verified user gets cookies + tokens; an unverified one gets
  // {requires_verification: true} and a freshly re-sent OTP, with no session.
  //
  // An account with two-factor on answers 401 with `code: "two_factor_required"`
  // until the same request is sent again with `totpCode` (6 digits) or
  // `recoveryCode`. A wrong code is 401 `two_factor_invalid`, a lock is 429
  // `two_factor_locked`; read them from `ApiError.code`. A success that used a
  // code adds `two_factor: "totp" | "recovery_code"`, and for a recovery code
  // also `recovery_codes_remaining`.
  login: ({ email, password, totpCode, recoveryCode }) =>
    post('/auth/login', {
      email: email.trim().toLowerCase(),
      password,
      ...(totpCode ? { totp_code: totpCode } : {}),
      ...(recoveryCode ? { recovery_code: recoveryCode } : {}),
    }),

  // This is the call that actually establishes the session.
  verifyEmail: ({ email, otp }) =>
    post('/auth/verify-email', { email: email.trim().toLowerCase(), otp }),

  resendVerificationOtp: (email) =>
    post('/auth/resend-verification-otp', { email: email.trim().toLowerCase() }),

  logout: () => post('/auth/logout'),
  me: () => get('/auth/me'),
  acceptConsent: () => post('/auth/accept-consent'),

  // Permanent. 403 means the password was wrong; nothing was deleted.
  deleteAccount: (password) => post('/auth/delete-account', { password }),

  forgotPassword: (email) =>
    post('/auth/forgot-password', { email: email.trim().toLowerCase() }),
  resetPassword: ({ token, newPassword }) =>
    post('/auth/reset-password', { token, new_password: newPassword }),

  // ── Account settings ───────────────────────────────────────────────────
  //
  // A wrong password on any of these is 403 "That password is not correct.",
  // never 401: a 401 still means the session is over. 429 means too many
  // attempts. Errors carry the sentence to show in `ApiError.message`.

  // Send only what changed. `phone: null` (or "") clears it. 200 returns the
  // stored {full_name, phone}, with the phone stripped to +digits.
  updateProfile: ({ fullName, phone }) =>
    put('/auth/profile', {
      ...(fullName !== undefined ? { full_name: fullName } : {}),
      ...(phone !== undefined ? { phone } : {}),
    }),

  // Signs out every OTHER device. The answer sets new cookies for this one,
  // and carries the tokens in the body too, which the web does not need.
  changePassword: ({ currentPassword, newPassword }) =>
    post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    }),
  signOutEverywhere: () => post('/auth/sign-out-everywhere'),

  // A 6-digit code goes to the NEW address; the address changes only when
  // confirmEmailChange gets it. {pending_email} comes back, and /auth/me
  // reports it until the change is confirmed or cancelled.
  requestEmailChange: ({ newEmail, password }) =>
    post('/auth/email/change', { new_email: newEmail.trim(), password }),
  confirmEmailChange: (otp) => post('/auth/email/confirm', { otp }),
  cancelEmailChange: () => del('/auth/email/change'),

  // {enabled, enabled_at, recovery_codes_remaining, setup_pending}
  twoFactorStatus: () => get('/auth/2fa'),
  // {secret, secret_grouped, otpauth_uri, qr_png_data_uri, issuer, account}.
  // Turns nothing on: that happens in twoFactorEnable.
  twoFactorSetup: (password) => post('/auth/2fa/setup', { password }),
  // {enabled: true, recovery_codes: [10]}. The only time the codes are sent.
  twoFactorEnable: (code) => post('/auth/2fa/enable', { code }),
  // Both take the password and ONE of `code` / `recoveryCode`. A wrong code is
  // 400 `two_factor_invalid`, a lock 429 `two_factor_locked`.
  twoFactorDisable: ({ password, code, recoveryCode }) =>
    post('/auth/2fa/disable', secondFactorBody({ password, code, recoveryCode })),
  twoFactorRecoveryCodes: ({ password, code, recoveryCode }) =>
    post('/auth/2fa/recovery-codes', secondFactorBody({ password, code, recoveryCode })),

  // Multipart, field `file` (JPG, PNG or WebP, at most 5 MB). The server
  // re-encodes it to a 256 px square, so what comes back is not the upload.
  uploadAvatar: (file) => postFile('/auth/avatar', file),
  deleteAvatar: () => del('/auth/avatar'),
  // The photo is an image, not JSON, so it is used as an <img> source rather
  // than fetched. `version` is `avatar_updated_at`: a new photo is a new URL,
  // so the browser cache (a day) never serves the old one.
  avatarUrl: (version) => `${apiUrl('/auth/avatar')}?v=${encodeURIComponent(version ?? '')}`,

  // {items: [{id, action, label, platform, created_at}]}, newest first.
  activity: (limit = 20) => get(`/auth/activity?limit=${limit}`),
}

function secondFactorBody({ password, code, recoveryCode }) {
  return {
    password,
    ...(code ? { code } : {}),
    ...(recoveryCode ? { recovery_code: recoveryCode } : {}),
  }
}

export const peptides = {
  // Public, unpaginated, no server-side search: the whole table comes back
  // (16 rows / ~14 KB today), so filtering happens client-side.
  list: () => get('/peptides'),
  get: (id) => get(`/peptides/${id}`),
}

export const stacks = {
  list: () => get('/stacks'),
  get: (id) => get(`/stacks/${id}`),
}

export const protocols = {
  list: () => get('/protocols'),
  get: (id) => get(`/protocols/${id}`),
  stats: () => get('/protocols/stats/summary'),
  create: (body) => post('/protocols', body),
  update: (id, body) => patch(`/protocols/${id}`, body),
  remove: (id) => del(`/protocols/${id}`),

  listLogs: (id) => get(`/protocols/${id}/logs`),
  addLog: (id, body) => post(`/protocols/${id}/logs`, body),
  removeLog: (id, logId) => del(`/protocols/${id}/logs/${logId}`),
}

export const tracker = {
  // Returns the union of standalone and protocol-scoped logs for this user.
  listLogs: () => get('/tracker/logs'),
  addLog: (body) => post('/tracker/logs', body),
  removeLog: (id) => del(`/tracker/logs/${id}`),
}

// The arithmetic runs in the browser and is free. These two save a
// calculation and read the history back, which are part of Peptora Pro.
export const calculator = {
  recordUse: (body) => post('/calculator/record-use', body),
  history: () => get('/calculator/history'),
}

export const subscriptions = {
  // {plan, access:{...}, plans:[...], payments_enabled}
  //
  // `payments_enabled` reports the DORMANT crypto rail, which is off unless
  // an admin turns it back on. It is not what gates the paywall — that is
  // `billing.instructions().manual_payments_enabled`.
  status: () => get('/subscriptions/status'),

  createCheckout: (plan) => post('/subscriptions/create-checkout', { plan }),
}

/**
 * Manual billing. Peptora is a one-time purchase verified by a person: the
 * user transfers money, files a claim with a receipt, and an admin approves
 * it. There is no gateway and no redirect — the whole flow stays in the app.
 */
export const billing = {
  // {price, currency, bank_details_md, payment_instructions_md,
  //  support_email, review_sla_hours, manual_payments_enabled, ...}
  instructions: () => get('/billing/instructions'),

  // Newest first. The first entry is what the status page renders.
  myClaims: () => get('/billing/claims/mine'),

  // 409 when one is already open — a user may hold only one claim at a time.
  createClaim: ({ amountClaimed, currency, reference, payerName, paidAt, userNote }) =>
    post('/billing/claims', {
      amount_claimed: amountClaimed,
      currency,
      reference,
      payer_name: payerName,
      paid_at: paidAt,
      user_note: userNote,
    }),

  // Multipart. The server sniffs the real type from the leading bytes and
  // re-encodes images, so a wrong extension is not fatal but a wrong file is.
  uploadReceipt: (claimId, file) => postFile(`/billing/claims/${claimId}/receipt`, file),

  cancelClaim: (claimId) => post(`/billing/claims/${claimId}/cancel`),

  // {items: [{id, kind, title, status, status_label, amount, currency, method,
  // reference, date, detail}]}, newest first. Needs a signed-in account, not
  // Peptora Pro. `amount` is null for an App Store subscription (Apple bills
  // it). Show `status_label` as the text and use `status` only for colour.
  history: () => get('/billing/history'),
}
