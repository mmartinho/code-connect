export default function Heading({ as: Tag = 'h1', children, className = '' }) {
  return <Tag className={`text-[26px] font-semibold lg:text-[31px] text-offwhite ${className}`}>{children}</Tag>
}
