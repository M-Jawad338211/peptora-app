import { afterEach, beforeEach, vi } from 'vitest'
import { ApiError } from '../api/client'
import { auth, billing } from '../api'

/**
 * The request shapes of the account settings endpoints, against
 * notes/CLIENT_CONTRACT.md. `fetch` is replaced, so nothing here needs the API.
 */

let calls

function respond(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

function stubFetch(...responses) {
  calls = []
  const queue = [...responses]
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init) => {
      calls.push({ url, init })
      return queue.length > 1 ? queue.shift() : queue[0]
    })
  )
}

const bodyOf = (i = 0) => JSON.parse(calls[i].init.body)

beforeEach(() => stubFetch(respond(200, {})))
afterEach(() => vi.unstubAllGlobals())

describe('login', () => {
  test('sends no code field until there is a code', async () => {
    await auth.login({ email: ' Ada@Example.com ', password: 'pw' })
    expect(calls[0].url).toBe('/api/auth/login')
    expect(bodyOf()).toEqual({ email: 'ada@example.com', password: 'pw' })
  })

  test('adds totp_code', async () => {
    await auth.login({ email: 'a@b.co', password: 'pw', totpCode: '123456' })
    expect(bodyOf()).toEqual({ email: 'a@b.co', password: 'pw', totp_code: '123456' })
  })

  test('adds recovery_code', async () => {
    await auth.login({ email: 'a@b.co', password: 'pw', recoveryCode: 'abcde-fghjk' })
    expect(bodyOf()).toEqual({ email: 'a@b.co', password: 'pw', recovery_code: 'abcde-fghjk' })
  })

  test('two_factor_required reaches the caller as a code, and is not retried', async () => {
    stubFetch(respond(401, { detail: 'Enter the 6-digit code.', code: 'two_factor_required' }))
    const err = await auth.login({ email: 'a@b.co', password: 'pw' }).catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect(err.status).toBe(401)
    expect(err.code).toBe('two_factor_required')
    expect(err.message).toBe('Enter the 6-digit code.')
    // A 401 here is an answer, not an expired token: no refresh, no replay.
    expect(calls).toHaveLength(1)
  })
})

describe('profile and password', () => {
  test('updateProfile sends only the fields it is given', async () => {
    await auth.updateProfile({ fullName: 'Ada Lovelace' })
    expect(calls[0].init.method).toBe('PUT')
    expect(calls[0].url).toBe('/api/auth/profile')
    expect(bodyOf()).toEqual({ full_name: 'Ada Lovelace' })

    await auth.updateProfile({ phone: '+14155550123' })
    expect(bodyOf(1)).toEqual({ phone: '+14155550123' })
  })

  test('updateProfile can clear the phone with null', async () => {
    await auth.updateProfile({ phone: null })
    expect(bodyOf()).toEqual({ phone: null })
  })

  test('changePassword', async () => {
    await auth.changePassword({ currentPassword: 'old', newPassword: 'new-pass-1' })
    expect(calls[0].url).toBe('/api/auth/change-password')
    expect(calls[0].init.method).toBe('POST')
    expect(bodyOf()).toEqual({ current_password: 'old', new_password: 'new-pass-1' })
  })

  test('signOutEverywhere has no body', async () => {
    await auth.signOutEverywhere()
    expect(calls[0].url).toBe('/api/auth/sign-out-everywhere')
    expect(calls[0].init.method).toBe('POST')
    expect(calls[0].init.body).toBeUndefined()
  })

  test('a wrong password is a 403 that is shown, not refreshed', async () => {
    stubFetch(respond(403, { detail: 'That password is not correct.' }))
    const err = await auth.changePassword({ currentPassword: 'x', newPassword: 'y' }).catch((e) => e)
    expect(err.status).toBe(403)
    expect(err.message).toBe('That password is not correct.')
    expect(calls).toHaveLength(1)
  })
})

describe('email change', () => {
  test('request, confirm and cancel', async () => {
    await auth.requestEmailChange({ newEmail: ' new@example.com ', password: 'pw' })
    expect(calls[0].url).toBe('/api/auth/email/change')
    expect(calls[0].init.method).toBe('POST')
    expect(bodyOf(0)).toEqual({ new_email: 'new@example.com', password: 'pw' })

    await auth.confirmEmailChange('123456')
    expect(calls[1].url).toBe('/api/auth/email/confirm')
    expect(bodyOf(1)).toEqual({ otp: '123456' })

    await auth.cancelEmailChange()
    expect(calls[2].url).toBe('/api/auth/email/change')
    expect(calls[2].init.method).toBe('DELETE')
  })
})

describe('two-factor', () => {
  test('status, setup and enable', async () => {
    await auth.twoFactorStatus()
    expect(calls[0].url).toBe('/api/auth/2fa')
    expect(calls[0].init.method).toBeUndefined()

    await auth.twoFactorSetup('pw')
    expect(calls[1].url).toBe('/api/auth/2fa/setup')
    expect(bodyOf(1)).toEqual({ password: 'pw' })

    await auth.twoFactorEnable('123456')
    expect(calls[2].url).toBe('/api/auth/2fa/enable')
    expect(bodyOf(2)).toEqual({ code: '123456' })
  })

  test('disable and new recovery codes send the password and one factor', async () => {
    await auth.twoFactorDisable({ password: 'pw', code: '123456' })
    expect(calls[0].url).toBe('/api/auth/2fa/disable')
    expect(bodyOf(0)).toEqual({ password: 'pw', code: '123456' })

    await auth.twoFactorDisable({ password: 'pw', recoveryCode: 'abcde-fghjk' })
    expect(bodyOf(1)).toEqual({ password: 'pw', recovery_code: 'abcde-fghjk' })

    await auth.twoFactorRecoveryCodes({ password: 'pw', code: '654321' })
    expect(calls[2].url).toBe('/api/auth/2fa/recovery-codes')
    expect(bodyOf(2)).toEqual({ password: 'pw', code: '654321' })
  })

  test('a wrong code carries its code for the screen to branch on', async () => {
    stubFetch(respond(400, { detail: 'That code is not correct.', code: 'two_factor_invalid' }))
    const err = await auth.twoFactorDisable({ password: 'pw', code: '000000' }).catch((e) => e)
    expect(err.status).toBe(400)
    expect(err.code).toBe('two_factor_invalid')
  })
})

describe('photo, activity and billing history', () => {
  test('uploadAvatar posts multipart with the field named file and no explicit content type', async () => {
    const file = new Blob(['x'], { type: 'image/png' })
    await auth.uploadAvatar(file)
    expect(calls[0].url).toBe('/api/auth/avatar')
    expect(calls[0].init.method).toBe('POST')
    expect(calls[0].init.body).toBeInstanceOf(FormData)
    expect(calls[0].init.body.get('file')).toBeInstanceOf(Blob)
    // The browser has to set the multipart boundary itself.
    expect(calls[0].init.headers['Content-Type']).toBeUndefined()
  })

  test('deleteAvatar', async () => {
    await auth.deleteAvatar()
    expect(calls[0].url).toBe('/api/auth/avatar')
    expect(calls[0].init.method).toBe('DELETE')
  })

  test('avatarUrl changes with the version so a new photo is not served from cache', () => {
    const a = auth.avatarUrl('2026-10-08T21:55:02.123456Z')
    const b = auth.avatarUrl('2026-10-09T08:00:00Z')
    expect(a).toBe('/api/auth/avatar?v=2026-10-08T21%3A55%3A02.123456Z')
    expect(a).not.toBe(b)
  })

  test('activity asks for twenty by default', async () => {
    await auth.activity()
    expect(calls[0].url).toBe('/api/auth/activity?limit=20')
    await auth.activity(5)
    expect(calls[1].url).toBe('/api/auth/activity?limit=5')
  })

  test('billing history', async () => {
    await billing.history()
    expect(calls[0].url).toBe('/api/billing/history')
  })
})
