import { ApiError } from '../api/client'

// The API answers with three different error shapes; every one of these was
// observed against the running backend.
describe('ApiError message extraction', () => {
  test('HTTPException detail string', () => {
    expect(new ApiError(401, { detail: 'Invalid email or password' }).message).toBe(
      'Invalid email or password'
    )
  })

  test('Pydantic 422 detail array names the offending field', () => {
    const err = new ApiError(422, {
      detail: [
        {
          type: 'value_error',
          loc: ['body', 'email'],
          msg: 'value is not a valid email address',
        },
      ],
    })
    expect(err.message).toBe('email: value is not a valid email address')
  })

  test('underscored field names are humanised', () => {
    const err = new ApiError(422, {
      detail: [{ loc: ['body', 'confirm_password'], msg: 'passwords do not match' }],
    })
    expect(err.message).toBe('confirm password: passwords do not match')
  })

  test('rate limiter uses `error`, not `detail`', () => {
    expect(new ApiError(429, { error: 'Rate limit exceeded: 10 per 1 minute' }).message).toBe(
      'Rate limit exceeded: 10 per 1 minute'
    )
  })

  test('500 handler uses `error` and carries a request id', () => {
    const err = new ApiError(500, { error: 'Internal server error', request_id: 'abc' })
    expect(err.message).toBe('Internal server error')
    expect(err.data.request_id).toBe('abc')
  })

  test('unparseable body still yields something actionable', () => {
    expect(new ApiError(502, {}).message).toBe('Request failed (502)')
  })

  test('status is preserved for callers that branch on it', () => {
    expect(new ApiError(403, { detail: 'Email verification required' }).status).toBe(403)
  })
})
