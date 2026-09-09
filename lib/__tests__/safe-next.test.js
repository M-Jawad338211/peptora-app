import { safeNext } from '../safe-next'

// login/page.js hard-navigates to this value after a successful login (see
// that file for why it can't use router.replace). window.location.href, unlike
// router.replace, will happily leave the app for an external origin, so this
// is the only thing standing between `?next=` and an open-redirect phishing
// vector — the victim just typed a real password into a real login page.
describe('safeNext', () => {
  test('accepts an ordinary relative path', () => {
    expect(safeNext('/app/billing')).toBe('/app/billing')
  })

  test('accepts a relative path with a query string', () => {
    expect(safeNext('/app/protocols?tab=active')).toBe('/app/protocols?tab=active')
  })

  test('falls back for a missing value', () => {
    expect(safeNext(null)).toBe('/app/home')
    expect(safeNext(undefined)).toBe('/app/home')
    expect(safeNext('')).toBe('/app/home')
  })

  test('falls back for a non-string value', () => {
    expect(safeNext(42)).toBe('/app/home')
    expect(safeNext({})).toBe('/app/home')
  })

  test('rejects an absolute external URL', () => {
    expect(safeNext('https://evil.example/phish')).toBe('/app/home')
    expect(safeNext('http://evil.example')).toBe('/app/home')
  })

  test('rejects a protocol-relative URL', () => {
    // Browsers resolve `//host` against the current protocol, so this is
    // just as much an off-site navigation as `https://host`.
    expect(safeNext('//evil.example')).toBe('/app/home')
  })

  test('rejects a backslash-prefixed URL', () => {
    // Some browsers normalise a leading backslash to a protocol-relative
    // slash before navigating, so `/\evil.example` reaches the same place.
    expect(safeNext('/\\evil.example')).toBe('/app/home')
  })

  test('rejects a path with no leading slash', () => {
    expect(safeNext('app/billing')).toBe('/app/home')
  })

  test('honours a custom fallback', () => {
    expect(safeNext('https://evil.example', '/app/consent')).toBe('/app/consent')
  })
})
