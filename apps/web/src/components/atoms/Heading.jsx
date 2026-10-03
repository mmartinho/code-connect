export default function Heading({ as: Tag = 'h1', children, className = '' }) {
  return <Tag className={`text-3xl font-semibold text-offwhite ${className}`}>{children}</Tag>
}
