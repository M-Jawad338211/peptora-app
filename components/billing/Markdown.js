/**
 * Minimal markdown renderer for admin-authored billing copy.
 *
 * Deliberately not a library. The only author is an admin editing bank details
 * in a textarea, the vocabulary is headings, bold, lists and paragraphs, and
 * pulling in a parser for that would ship a large dependency to render nine
 * lines of text. Nothing here interpolates HTML — every value goes through
 * React as text, so an admin cannot inject markup into a customer's page even
 * by accident.
 */

function inline(text, keyBase) {
  // Split on **bold** and `code`, keeping the delimiters so the pieces can be
  // typed by their wrapper.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean)
  return parts.map((part, i) => {
    const key = `${keyBase}-${i}`
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={key} className="font-semibold text-tx">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={key}
          className="rounded bg-navy px-1.5 py-0.5 font-mono text-[13px] text-tx select-all"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return <span key={key}>{part}</span>
  })
}

export default function Markdown({ source = '', className = '' }) {
  const lines = String(source).split('\n')
  const blocks = []
  let list = null

  const flush = () => {
    if (list) {
      blocks.push(
        <ol key={`l${blocks.length}`} className="mb-3 list-decimal space-y-1.5 pl-5 text-tx2 marker:text-tx3">
          {list.map((item, i) => (
            <li key={i} className="text-[13.5px] leading-6">
              {inline(item, `li${blocks.length}-${i}`)}
            </li>
          ))}
        </ol>
      )
      list = null
    }
  }

  lines.forEach((line, i) => {
    const trimmed = line.trim()

    if (!trimmed) {
      flush()
      return
    }

    const ordered = trimmed.match(/^\d+\.\s+(.*)$/)
    const bullet = trimmed.match(/^[-*]\s+(.*)$/)
    if (ordered || bullet) {
      list ??= []
      list.push((ordered || bullet)[1])
      return
    }

    flush()

    if (trimmed.startsWith('### ')) {
      blocks.push(
        <h3 key={i} className="mb-2 mt-4 text-[13px] font-bold text-tx first:mt-0">
          {inline(trimmed.slice(4), `h${i}`)}
        </h3>
      )
      return
    }
    if (trimmed.startsWith('## ')) {
      blocks.push(
        <h3 key={i} className="mb-2 mt-4 text-[15px] font-bold text-tx first:mt-0">
          {inline(trimmed.slice(3), `h${i}`)}
        </h3>
      )
      return
    }
    if (/^_.+_$/.test(trimmed)) {
      blocks.push(
        <p key={i} className="mb-3 text-[13px] italic leading-6 text-tx3-body">
          {trimmed.slice(1, -1)}
        </p>
      )
      return
    }

    blocks.push(
      <p key={i} className="mb-3 text-[13.5px] leading-6 text-tx2 last:mb-0">
        {inline(trimmed, `p${i}`)}
      </p>
    )
  })

  flush()
  return <div className={className}>{blocks}</div>
}
