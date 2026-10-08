import Avatar from '../atoms/Avatar'
import { toHandle } from '../../utils/text'

export default function AuthorBadge({ name }) {
  return (
    <span className="flex items-center gap-2 text-[15px] font-semibold text-muted">
      <Avatar name={name} />
      {toHandle(name)}
    </span>
  )
}
