import { ApiError } from '../api/client'
import {
  ACCOUNT_TABS,
  AVATAR_MAX_BYTES,
  avatarFileProblem,
  countLabel,
  errorText,
  formatMoney,
  formatWhen,
  isSecondFactorError,
  isWrongPassword,
  looksLikeEmail,
  normalisePhone,
  onlyDigits,
  passwordProblem,
  phoneProblem,
  platformLabel,
  recoveryCodesText,
  statusColor,
  tabFromParam,
  tabHref,
} from '../account'

describe('sections of the settings page', () => {
  test('a known section is kept', () => {
    expect(tabFromParam('security')).toBe('security')
    expect(tabFromParam('billing')).toBe('billing')
    expect(tabFromParam('profile')).toBe('profile')
  })

  test('anything else is the first section', () => {
    expect(tabFromParam(null)).toBe('profile')
    expect(tabFromParam(undefined)).toBe('profile')
    expect(tabFromParam('')).toBe('profile')
    expect(tabFromParam('admin')).toBe('profile')
    expect(tabFromParam('__proto__')).toBe('profile')
  })

  test('the first section keeps the plain URL, the others carry ?tab=', () => {
    expect(tabHref('profile')).toBe('/app/profile')
    expect(tabHref('security')).toBe('/app/profile?tab=security')
    expect(tabHref('billing')).toBe('/app/profile?tab=billing')
  })

  test('every section round-trips through its own URL', () => {
    for (const { key } of ACCOUNT_TABS) {
      const param = new URL(tabHref(key), 'http://x').searchParams.get('tab')
      expect(tabFromParam(param)).toBe(key)
    }
  })
})

describe('onlyDigits', () => {
  test('keeps digits and cuts to six', () => {
    expect(onlyDigits('123 456')).toBe('123456')
    expect(onlyDigits('12-34-56-78')).toBe('123456')
    expect(onlyDigits('abc')).toBe('')
  })

  test('tolerates a missing value and honours another length', () => {
    expect(onlyDigits(undefined)).toBe('')
    expect(onlyDigits(null)).toBe('')
    expect(onlyDigits('1234567890', 4)).toBe('1234')
  })
})

describe('looksLikeEmail', () => {
  test('accepts an ordinary address, with surrounding spaces', () => {
    expect(looksLikeEmail('ada@example.com')).toBe(true)
    expect(looksLikeEmail('  Ada.L+tag@mail.example.org ')).toBe(true)
  })

  test('rejects the obvious typos', () => {
    expect(looksLikeEmail('')).toBe(false)
    expect(looksLikeEmail('ada')).toBe(false)
    expect(looksLikeEmail('ada@')).toBe(false)
    expect(looksLikeEmail('ada@example')).toBe(false)
    expect(looksLikeEmail('a da@example.com')).toBe(false)
  })
})

describe('phone number', () => {
  test('punctuation is removed the way the server removes it', () => {
    expect(normalisePhone('+92 300 1234567')).toBe('+923001234567')
    expect(normalisePhone('+1 (415) 555-0123')).toBe('+14155550123')
    expect(normalisePhone('+44.20.7946.0958')).toBe('+442079460958')
  })

  test('an international number is fine, an empty one clears the field', () => {
    expect(phoneProblem('+14155550123')).toBe('')
    expect(phoneProblem('+92 300 1234567')).toBe('')
    expect(phoneProblem('')).toBe('')
    expect(phoneProblem('   ')).toBe('')
  })

  test('a local number, a short one and a long one are refused with the server wording', () => {
    const message = 'Enter the number in international format, for example +14155550123.'
    expect(phoneProblem('0300 1234567')).toBe(message)
    expect(phoneProblem('+12345')).toBe(message)
    expect(phoneProblem('+1234567890123456')).toBe(message)
    expect(phoneProblem('+0123456789')).toBe(message)
    expect(phoneProblem('call me')).toBe(message)
  })
})

describe('passwordProblem', () => {
  const ok = { current: 'Password123', next: 'Another-pass-9', repeat: 'Another-pass-9' }

  test('a good change has no problem', () => {
    expect(passwordProblem(ok)).toBeNull()
  })

  test('the current password is required', () => {
    expect(passwordProblem({ ...ok, current: '' })).toEqual({
      field: 'current',
      message: 'Enter your current password.',
    })
  })

  test('too short, with the server wording', () => {
    expect(passwordProblem({ ...ok, next: 'short', repeat: 'short' })).toEqual({
      field: 'next',
      message: 'Password must be at least 8 characters',
    })
  })

  test('longer than bcrypt allows, counted in bytes', () => {
    // 40 characters of two bytes each is 80 bytes.
    const long = 'é'.repeat(40)
    expect(passwordProblem({ ...ok, next: long, repeat: long })).toEqual({
      field: 'next',
      message: 'Password must be 72 characters or fewer',
    })
  })

  test('the same as the current one', () => {
    expect(passwordProblem({ current: 'Password123', next: 'Password123', repeat: 'Password123' })).toEqual({
      field: 'next',
      message: 'Choose a password you are not already using.',
    })
  })

  test('a repeat that does not match', () => {
    expect(passwordProblem({ ...ok, repeat: 'Another-pass-8' })).toEqual({
      field: 'repeat',
      message: 'The two new passwords do not match.',
    })
  })
})

describe('avatarFileProblem', () => {
  test('accepts the three image types within the limit', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(avatarFileProblem({ type, size: 1000 })).toBe('')
    }
    expect(avatarFileProblem({ type: 'image/png', size: AVATAR_MAX_BYTES })).toBe('')
  })

  test('refuses other types, with the server wording', () => {
    expect(avatarFileProblem({ type: 'image/heic', size: 1000 })).toBe('Upload a JPG, PNG or WebP image.')
    expect(avatarFileProblem({ type: 'application/pdf', size: 1000 })).toBe('Upload a JPG, PNG or WebP image.')
  })

  test('refuses a file over 5 MB', () => {
    expect(avatarFileProblem({ type: 'image/png', size: AVATAR_MAX_BYTES + 1 })).toBe(
      'That image is larger than 5 MB.'
    )
  })

  test('leaves a file with no reported type to the server', () => {
    expect(avatarFileProblem({ type: '', size: 1000 })).toBe('')
  })

  test('nothing chosen', () => {
    expect(avatarFileProblem(null)).toBe('Choose an image.')
  })
})

describe('errors', () => {
  test('a wrong password is a 403', () => {
    expect(isWrongPassword(new ApiError(403, { detail: 'That password is not correct.' }))).toBe(true)
    expect(isWrongPassword(new ApiError(401, { detail: 'Not authenticated' }))).toBe(false)
    expect(isWrongPassword(new Error('x'))).toBe(false)
  })

  test('a second-factor error is told apart by its code', () => {
    expect(isSecondFactorError(new ApiError(400, { detail: 'x', code: 'two_factor_invalid' }))).toBe(true)
    expect(isSecondFactorError(new ApiError(429, { detail: 'x', code: 'two_factor_locked' }))).toBe(true)
    expect(isSecondFactorError(new ApiError(400, { detail: 'x' }))).toBe(false)
    expect(isSecondFactorError(null)).toBe(false)
  })

  test('the server sentence is shown as it is', () => {
    expect(errorText(new ApiError(400, { detail: 'That code is not correct.' }))).toBe(
      'That code is not correct.'
    )
    expect(errorText(new ApiError(429, { detail: 'Too many attempts today. Try again tomorrow.' }))).toBe(
      'Too many attempts today. Try again tomorrow.'
    )
  })

  test('the rate limiter has no sentence, so it gets one', () => {
    expect(errorText(new ApiError(429, { error: 'Rate limit exceeded: 5 per 1 minute' }))).toBe(
      'Too many attempts. Wait a minute and try again.'
    )
  })

  test('a request that never arrived', () => {
    expect(errorText(new TypeError('Failed to fetch'))).toBe(
      'Could not reach Peptora. Check your connection and try again.'
    )
  })
})

describe('wording', () => {
  test('countLabel', () => {
    expect(countLabel(0, 'recovery code')).toBe('0 recovery codes')
    expect(countLabel(1, 'recovery code')).toBe('1 recovery code')
    expect(countLabel(9, 'recovery code')).toBe('9 recovery codes')
  })

  test('platformLabel', () => {
    expect(platformLabel('web')).toBe('Web')
    expect(platformLabel('android')).toBe('Android app')
    expect(platformLabel('ios')).toBe('iPhone app')
    expect(platformLabel('IOS')).toBe('iPhone app')
    expect(platformLabel('expo-go')).toBe('Expo-go')
    expect(platformLabel(null)).toBe('')
    expect(platformLabel('  ')).toBe('')
  })

  test('formatWhen leaves out the year only for this year', () => {
    const now = new Date('2026-10-09T12:00:00Z')
    const thisYear = formatWhen('2026-10-08T21:55:02.123456Z', { now, locale: 'en-US' })
    const lastYear = formatWhen('2025-12-31T10:00:00Z', { now, locale: 'en-US' })
    expect(thisYear).toMatch(/Oct/)
    expect(thisYear).not.toMatch(/2026/)
    expect(lastYear).toMatch(/2025/)
  })

  test('formatWhen on nothing or nonsense is empty', () => {
    expect(formatWhen(null)).toBe('')
    expect(formatWhen('not a date')).toBe('')
  })
})

describe('billing history', () => {
  test('every status the API sends has a colour, and an unknown one a neutral', () => {
    for (const s of ['paid', 'pending', 'rejected', 'cancelled', 'active', 'expired', 'refunded']) {
      expect(statusColor(s)).toMatch(/^#[0-9a-f]{6}$/i)
    }
    expect(statusColor('something-new')).toBe(statusColor('cancelled'))
  })

  test('a rejected payment is not red', () => {
    expect(statusColor('rejected')).not.toBe('#ff4757')
  })

  test('money', () => {
    expect(formatMoney(29, 'USD', 'en-US')).toBe('$29.00')
    expect(formatMoney('29.5', 'usd', 'en-US')).toBe('$29.50')
    expect(formatMoney(12, 'NOTACODE', 'en-US')).toBe('NOTACODE 12.00')
    expect(formatMoney(12, null)).toBe('12.00')
  })

  test('an App Store subscription has no amount', () => {
    expect(formatMoney(null, null)).toBe('')
    expect(formatMoney(undefined, 'USD')).toBe('')
  })
})

describe('recoveryCodesText', () => {
  const codes = Array.from({ length: 10 }, (_, i) => `abcd${i}-efgh${i}`)
  const text = recoveryCodesText({
    codes,
    email: 'ada@example.com',
    createdAt: new Date('2026-10-08T21:55:02Z'),
  })

  test('names the account and the day', () => {
    expect(text).toContain('Account: ada@example.com')
    expect(text).toContain('Created: 2026-10-08')
  })

  test('lists every code on its own numbered line', () => {
    const lines = text.split('\n')
    expect(lines).toContain(' 1. abcd0-efgh0')
    expect(lines).toContain('10. abcd9-efgh9')
  })

  test('uses plain punctuation', () => {
    expect(text).not.toMatch(/[‒-―…←-⇿]/)
  })

  test('works without an email', () => {
    expect(recoveryCodesText({ codes: ['aaaaa-bbbbb'] })).not.toContain('Account:')
  })
})
