/**
 * Validates a `?next=` redirect target before a hard navigation.
 *
 * `router.replace()` could never leave the app — Next treats an absolute
 * external URL as an internal route and it just 404s. `window.location.href`
 * has no such guard: it honors an external URL outright. Since the login,
 * consent and verify-email flows switched to hard navigation (to bypass a
 * stale Router Cache entry — see those pages for why), an unvalidated `next`
 * would turn `/app/auth/login?next=https://evil.example` into a working
 * phishing redirect straight out of a legitimate login. This is exactly the
 * open-redirect shape those attacks use — the victim just typed a real
 * password into a real login page.
 *
 * Only a same-origin, single-leading-slash path is accepted. `//evil.com`
 * and `/\evil.com` are both rejected — some browsers treat either as
 * protocol-relative and will still navigate off-site.
 */
export function safeNext(value, fallback = '/app/home') {
  if (typeof value !== 'string' || !value) return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback
  }
  return value
}
