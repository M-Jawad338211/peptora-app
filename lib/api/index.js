import { get, post, patch, del, postFile } from './client'

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
  login: ({ email, password }) =>
    post('/auth/login', { email: email.trim().toLowerCase(), password }),

  // This is the call that actually establishes the session.
  verifyEmail: ({ email, otp }) =>
    post('/auth/verify-email', { email: email.trim().toLowerCase(), otp }),

  resendVerificationOtp: (email) =>
    post('/auth/resend-verification-otp', { email: email.trim().toLowerCase() }),

  logout: () => post('/auth/logout'),
  me: () => get('/auth/me'),
  acceptConsent: () => post('/auth/accept-consent'),

  forgotPassword: (email) =>
    post('/auth/forgot-password', { email: email.trim().toLowerCase() }),
  resetPassword: ({ token, newPassword }) =>
    post('/auth/reset-password', { token, new_password: newPassword }),
}

export const peptides = {
  // Public, unpaginated, no server-side search — the whole table comes back
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

export const calculator = {
  checkTrial: ({ deviceFingerprint, platform = 'web' }) =>
    post('/calculator/check-trial', {
      device_fingerprint: deviceFingerprint,
      platform,
    }),
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
}
