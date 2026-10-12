/**
 * Copy text to the clipboard. Resolves true when it worked.
 *
 * The async API needs a secure context and a user gesture; the fallback covers
 * a browser that refuses it. Used for the authenticator setup key and the
 * recovery codes, which are secrets: nothing is logged and nothing is kept.
 */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fall through to the selection-based copy.
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

/** Offer `text` to the user as a file download. */
export function downloadText(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  // Revoked after the click has been handled.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
