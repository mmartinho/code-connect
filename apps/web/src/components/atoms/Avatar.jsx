import { getInitials } from '../../utils/text'

// O nome do autor aparece sempre ao lado, então o avatar é decorativo
export default function Avatar({ name, className = 'size-8' }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-light text-[13px] font-semibold text-surface ${className}`}
    >
      {getInitials(name)}
    </span>
  )
}
