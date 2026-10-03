export default function Button({ children, icon, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-brand px-4 text-xl font-semibold text-surface transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
      {icon}
    </button>
  )
}
