/**
 * Surface container. Native uses radius 10/12/14/16 and padding 12–24 for the
 * same visual role; standardised here on the canonical radius 14 / padding 16.
 */
export default function Card({ as: Tag = 'div', className = '', ...props }) {
  return <Tag className={`card p-4 ${className}`} {...props} />
}
