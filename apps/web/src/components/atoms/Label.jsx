export default function Label({ children, className = '', ...props }) {
  return (
    <label className={`text-lg text-offwhite ${className}`} {...props}>
      {children}
    </label>
  )
}
