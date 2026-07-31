/**
 * Status pill. Colour comes from the peptide colour maps, so it is applied
 * inline rather than as a utility class.
 *
 * The label is always rendered as text — native encodes evidence level, FDA
 * status and category by colour alone, which is invisible to anyone with a
 * colour vision deficiency.
 */
export default function Badge({ label, color = '#6b7788', title }) {
  if (!label) return null
  return (
    <span
      title={title}
      className="inline-flex items-center rounded-[5px] border px-[7px] py-[3px] text-[10px] font-bold tracking-[0.2px]"
      style={{
        color,
        backgroundColor: `${color}22`,
        borderColor: `${color}55`,
      }}
    >
      {label}
    </span>
  )
}
