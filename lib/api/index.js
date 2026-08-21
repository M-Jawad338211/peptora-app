import { get, post, patch, del } from './client'

export { ApiError } from './client'

/**
 * Endpoint surface, mirroring peptora-android/src/api/index.js minus the AI
 * and subscription modules (no AI on web; payments are off).
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
