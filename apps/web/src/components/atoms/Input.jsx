export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded bg-muted px-4 py-2 text-[15px] text-page placeholder:text-surface aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-error focus:outline-2 focus:outline-offset-2 focus:outline-brand ${className}`}
      {...props}
    />
  )
}
