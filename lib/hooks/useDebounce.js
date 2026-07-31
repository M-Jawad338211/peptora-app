'use client'

import { useEffect, useState } from 'react'

/**
 * Delay a fast-changing value. Native filters the full peptide list on every
 * keystroke over unvirtualised cards, re-rendering everything per character.
 */
export function useDebounce(value, delay = 200) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return debounced
}
