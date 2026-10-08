export default function Tab({ children, active = false, ...props }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      tabIndex={active ? 0 : -1}
      className={`cursor-pointer rounded px-1 text-[22px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        active ? 'font-semibold text-brand underline' : 'text-muted hover:text-offwhite'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}
