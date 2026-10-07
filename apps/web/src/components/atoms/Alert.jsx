export default function Alert({ children, className = '' }) {
  if (!children) return null
  return (
    <p role="alert" className={`text-[15px] text-error ${className}`}>
      {children}
    </p>
  )
}
