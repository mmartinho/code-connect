export default function Label({ children, required = false, className = '', ...props }) {
  // o asterisco é gerado por CSS para não entrar no texto do rótulo
  const requiredMark = required ? "after:ml-1 after:content-['*']" : ''

  return (
    <label className={`text-lg text-offwhite ${requiredMark} ${className}`} {...props}>
      {children}
    </label>
  )
}
