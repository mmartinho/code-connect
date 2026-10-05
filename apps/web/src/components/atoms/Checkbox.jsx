import { useId } from 'react'

export default function Checkbox({ label, id, ...props }) {
  const generatedId = useId()
  const checkboxId = id ?? generatedId

  return (
    <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2 text-[15px] text-muted">
      <span className="relative flex">
        <input
          id={checkboxId}
          type="checkbox"
          className="peer size-7 cursor-pointer appearance-none rounded border-2 border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          {...props}
        />
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 m-auto hidden size-4 text-brand peer-checked:block"
        >
          <path
            d="m5 12 5 5 9-10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label}
    </label>
  )
}
