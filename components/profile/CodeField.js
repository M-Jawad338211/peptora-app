'use client'

import Field from '@/components/ui/Field'
import { onlyDigits } from '@/lib/account'

/**
 * The 6-digit code input, as on the verify-email page: numeric keyboard, the
 * browser may offer the code from a message, wide letter spacing. Keeps digits
 * only. `onChange` receives the cleaned string, not the event.
 */
export default function CodeField({
  value,
  onChange,
  label = '6-digit code',
  inputClassName = '',
  ...props
}) {
  return (
    <Field
      label={label}
      autoComplete="one-time-code"
      inputMode="numeric"
      maxLength={6}
      placeholder="000000"
      value={value}
      onChange={(e) => onChange(onlyDigits(e.target.value))}
      inputClassName={`text-center text-2xl font-bold tracking-[8px] ${inputClassName}`}
      {...props}
    />
  )
}
