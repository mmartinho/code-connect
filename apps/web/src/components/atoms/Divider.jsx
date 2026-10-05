export default function Divider({ children }) {
  return (
    <div className="flex items-center gap-4 text-offwhite">
      <span aria-hidden="true" className="h-px flex-1 bg-offwhite" />
      {children && <span className="text-[15px]">{children}</span>}
      <span aria-hidden="true" className="h-px flex-1 bg-offwhite" />
    </div>
  )
}
