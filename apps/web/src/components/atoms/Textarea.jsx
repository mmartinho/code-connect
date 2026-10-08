export default function Textarea({ className = '', rows = 5, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full resize-y rounded bg-muted px-4 py-2 text-[15px] text-page placeholder:text-surface aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-error focus:outline-2 focus:outline-offset-2 focus:outline-brand ${className}`}
      {...props}
    />
  )
}
