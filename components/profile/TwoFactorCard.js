'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { auth } from '@/lib/api'
import { qk } from '@/lib/query/keys'
import { refreshAccount } from '@/lib/query/account'
import { countLabel, errorText, isSecondFactorError, isWrongPassword } from '@/lib/account'
import { formatDate } from '@/lib/format'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ErrorState from '@/components/ui/ErrorState'
import Field from '@/components/ui/Field'
import Skeleton from '@/components/ui/Skeleton'
import CodeField from './CodeField'
import CopyButton from './CopyButton'
import SettingsCard from './SettingsCard'

const APPS = 'Google Authenticator, Microsoft Authenticator, Authy or 1Password'

/**
 * Two-factor authentication with an authenticator app.
 *
 * Off: a guided flow. Confirm the password, scan the QR code (or type the
 * setup key), enter the first 6-digit code, then save the ten recovery codes.
 * On: the status, new recovery codes and turning it off, each of which asks
 * for the password and a code (or a recovery code instead).
 *
 * The recovery codes are not shown here: `onRecoveryCodes` hands them to the
 * settings page, which owns the dialog that shows them.
 */
export default function TwoFactorCard({ onRecoveryCodes }) {
  const queryClient = useQueryClient()
  const status = useQuery({ queryKey: qk.twoFactor, queryFn: auth.twoFactorStatus, staleTime: 0 })
  const [flow, setFlow] = useState(null) // null | enable | disable | regenerate
  const [notice, setNotice] = useState('')

  const enabled = !!status.data?.enabled
  const left = status.data?.recovery_codes_remaining ?? 0

  const finish = async (message, codes) => {
    await refreshAccount(queryClient, { twoFactor: true })
    setFlow(null)
    setNotice(message)
    if (codes) onRecoveryCodes(codes)
  }

  return (
    <SettingsCard
      title="Two-factor authentication"
      description={
        // The steps of the guided flow explain themselves.
        flow === 'enable'
          ? undefined
          : enabled
            ? 'Signing in needs your password and a 6-digit code from your authenticator app.'
            : `Add a second step when you sign in: a 6-digit code from an authenticator app such as ${APPS}.`
      }
      aside={
        status.data ? (
          <Badge label={enabled ? 'On' : 'Off'} color={enabled ? '#00d68f' : '#9fb0c5'} />
        ) : null
      }
    >
      {status.isPending ? (
        <Skeleton className="mt-3 h-11" />
      ) : status.isError ? (
        <ErrorState
          title="Could not load this setting"
          message={status.error?.message}
          onRetry={() => status.refetch()}
          pending={status.isFetching}
        />
      ) : flow === 'enable' ? (
        <EnableFlow
          onCancel={() => setFlow(null)}
          onEnabled={(codes) => finish('Two-factor authentication is on.', codes)}
        />
      ) : flow === 'disable' ? (
        <SecondFactorForm
          intro="Turning it off removes the second step from signing in. Your recovery codes stop working."
          submitLabel="Turn off"
          pendingLabel="Turning off"
          danger
          run={auth.twoFactorDisable}
          onDone={() => finish('Two-factor authentication is off.')}
          onCancel={() => setFlow(null)}
        />
      ) : flow === 'regenerate' ? (
        <SecondFactorForm
          intro="You get ten new codes. The ones you have now stop working, used or not."
          submitLabel="Get new codes"
          pendingLabel="Creating"
          run={auth.twoFactorRecoveryCodes}
          onDone={(res) =>
            finish('New recovery codes created. The old ones no longer work.', res.recovery_codes)
          }
          onCancel={() => setFlow(null)}
        />
      ) : enabled ? (
        <div className="mt-3">
          <dl className="space-y-1.5 text-[13px]">
            {status.data.enabled_at && (
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-tx3-body">On since</dt>
                <dd className="text-right text-tx">{formatDate(status.data.enabled_at)}</dd>
              </div>
            )}
            <div className="flex items-baseline justify-between gap-3">
              <dt className="text-tx3-body">Recovery codes left</dt>
              <dd className={`text-right font-semibold ${left === 0 ? 'text-danger-text' : left <= 3 ? 'text-warn' : 'text-tx'}`}>
                {left}
              </dd>
            </div>
          </dl>
          {left <= 3 && (
            <p className="mt-2 text-[12px] leading-5 text-tx3-body">
              {left === 0
                ? 'You have no recovery codes left. Get new ones before you lose your authenticator app.'
                : `You have ${countLabel(left, 'recovery code')} left. Get new ones before they run out.`}
            </p>
          )}
          <div className="mt-3.5 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setNotice('')
                setFlow('regenerate')
              }}
            >
              Get new recovery codes
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => {
                setNotice('')
                setFlow('disable')
              }}
            >
              Turn off
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          {status.data.setup_pending && (
            <p className="mb-3 text-[12px] leading-5 text-tx3-body">
              Setup was started and not finished. Starting again gives you a new key.
            </p>
          )}
          <Button
            type="button"
            onClick={() => {
              setNotice('')
              setFlow('enable')
            }}
          >
            Turn on
          </Button>
        </div>
      )}

      {notice && !flow && (
        <p role="status" className="mt-3 text-[13px] leading-5 text-teal">
          {notice}
        </p>
      )}
    </SettingsCard>
  )
}

/** Password, then the QR code and the first code. */
function EnableFlow({ onCancel, onEnabled }) {
  const [setup, setSetup] = useState(null)

  return setup ? (
    <ScanStep setup={setup} onCancel={onCancel} onEnabled={onEnabled} />
  ) : (
    <PasswordStep onSetup={setSetup} onCancel={onCancel} />
  )
}

function PasswordStep({ onSetup, onCancel }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')

  const start = useMutation({
    mutationFn: () => auth.twoFactorSetup(password),
    onSuccess: (data) => {
      setPassword('')
      onSetup(data)
    },
    onError: (err) => {
      if (isWrongPassword(err)) setError(err.message)
      else setFormError(errorText(err))
    },
  })

  const submit = (e) => {
    e.preventDefault()
    if (start.isPending) return
    if (!password) {
      setError('Enter your password to continue.')
      return
    }
    setError('')
    setFormError('')
    start.mutate()
  }

  return (
    <form onSubmit={submit} noValidate className="mt-3 space-y-3.5">
      <p className="text-[13px] leading-5 text-tx3-body">
        First, confirm your password. Then you scan a QR code with your authenticator app.
      </p>
      <Field
        label="Current password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setError('')
        }}
        error={error}
      />
      {formError && (
        <p role="alert" className="text-[13px] text-danger-text">
          {formError}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={start.isPending}>
          {start.isPending ? 'Checking' : 'Continue'}
        </Button>
        <Button type="button" variant="secondary" disabled={start.isPending} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function ScanStep({ setup, onCancel, onEnabled }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const enable = useMutation({
    mutationFn: () => auth.twoFactorEnable(code),
    onSuccess: (res) => onEnabled(res.recovery_codes),
    onError: (err) => setError(errorText(err)),
  })

  const submit = (e) => {
    e.preventDefault()
    if (enable.isPending) return
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your app.')
      return
    }
    setError('')
    enable.mutate()
  }

  return (
    <form onSubmit={submit} noValidate className="mt-3">
      <p className="mb-3 text-[13px] leading-5 text-tx3-body">
        Scan this QR code with an authenticator app such as {APPS}. On a phone, add the setup key
        in the app by hand instead.
      </p>

      <div className="mb-3.5 flex flex-col items-start gap-3.5 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={setup.qr_png_data_uri}
          alt={`QR code that adds ${setup.issuer} (${setup.account}) to your authenticator app`}
          width={176}
          height={176}
          className="size-44 shrink-0 rounded-[10px] bg-white"
        />
        <div className="min-w-0">
          <p className="mb-1 font-mono text-[11px] tracking-[0.5px] text-tx3-body uppercase">
            Setup key
          </p>
          <p className="mb-2 font-mono text-[15px] leading-6 tracking-wide break-words text-tx select-all">
            {setup.secret_grouped}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <CopyButton text={setup.secret} label="Copy key" aria-label="Copy setup key" />
          </div>
        </div>
      </div>

      <CodeField
        label="6-digit code from the app"
        name="code"
        value={code}
        onChange={(value) => {
          setCode(value)
          setError('')
        }}
        error={error}
        hint="Enter the code the app shows for Peptora."
      />

      <div className="mt-3.5 flex flex-wrap gap-2">
        <Button type="submit" disabled={enable.isPending || code.length !== 6}>
          {enable.isPending ? 'Turning on' : 'Turn on'}
        </Button>
        <Button type="button" variant="secondary" disabled={enable.isPending} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

/**
 * Password plus a code, for turning two-factor off and for new recovery codes.
 * "Use a recovery code instead" swaps the 6-digit field for a recovery code
 * field. Both are kept while the user switches, and everything typed stays in
 * place when the server refuses.
 */
function SecondFactorForm({ intro, submitLabel, pendingLabel, danger = false, run, onDone, onCancel }) {
  const [password, setPassword] = useState('')
  const [totp, setTotp] = useState('')
  const [recovery, setRecovery] = useState('')
  const [useRecovery, setUseRecovery] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')

  const send = useMutation({
    mutationFn: () =>
      run({
        password,
        code: useRecovery ? undefined : totp,
        recoveryCode: useRecovery ? recovery.trim() : undefined,
      }),
    onSuccess: (res) => onDone(res),
    onError: (err) => {
      if (isWrongPassword(err)) setErrors({ password: err.message })
      else if (isSecondFactorError(err)) setErrors({ code: err.message })
      else setFormError(errorText(err))
    },
  })

  const ready = !!password && (useRecovery ? !!recovery.trim() : totp.length === 6)

  const submit = (e) => {
    e.preventDefault()
    if (send.isPending) return
    if (!ready) {
      setErrors({
        ...(password ? {} : { password: 'Enter your password to confirm.' }),
        ...(useRecovery
          ? recovery.trim()
            ? {}
            : { code: 'Enter a recovery code.' }
          : totp.length === 6
            ? {}
            : { code: 'Enter the 6-digit code from your app.' }),
      })
      return
    }
    setErrors({})
    setFormError('')
    send.mutate()
  }

  return (
    <form onSubmit={submit} noValidate className="mt-3 space-y-3.5">
      <p className="text-[13px] leading-5 text-tx3-body">{intro}</p>
      <Field
        label="Current password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setErrors((p) => ({ ...p, password: undefined }))
        }}
        error={errors.password}
      />

      {useRecovery ? (
        <Field
          key="recovery"
          label="Recovery code"
          name="recovery_code"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="xxxxx-xxxxx"
          value={recovery}
          onChange={(e) => {
            setRecovery(e.target.value)
            setErrors((p) => ({ ...p, code: undefined }))
          }}
          error={errors.code}
          hint="Each recovery code works once."
          inputClassName="font-mono"
        />
      ) : (
        <CodeField
          key="totp"
          label="6-digit code"
          name="code"
          value={totp}
          onChange={(value) => {
            setTotp(value)
            setErrors((p) => ({ ...p, code: undefined }))
          }}
          error={errors.code}
          hint="Codes change every 30 seconds and each one works once."
        />
      )}
      <button
        type="button"
        onClick={() => {
          setUseRecovery((v) => !v)
          setErrors((p) => ({ ...p, code: undefined }))
        }}
        className="tap -mt-1 px-1 text-[13px] font-semibold text-teal"
      >
        {useRecovery ? 'Use the authenticator code instead' : 'Use a recovery code instead'}
      </button>

      {formError && (
        <p role="alert" className="text-[13px] text-danger-text">
          {formError}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant={danger ? 'danger' : 'primary'} disabled={send.isPending}>
          {send.isPending ? pendingLabel : submitLabel}
        </Button>
        <Button type="button" variant="secondary" disabled={send.isPending} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
