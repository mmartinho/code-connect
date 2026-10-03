export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`h-10 w-full rounded bg-muted px-4 text-surface placeholder:text-surface/70 focus:outline-2 focus:outline-offset-2 focus:outline-brand ${className}`}
      {...props}
    />
  )
}
