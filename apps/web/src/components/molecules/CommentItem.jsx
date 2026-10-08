import { useState } from 'react'
import Avatar from '../atoms/Avatar'
import CommentForm from './CommentForm'
import { toHandle } from '../../utils/text'

const action =
  'cursor-pointer rounded text-[15px] font-semibold text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface'

function CommentLine({ comment }) {
  return (
    <div className="flex items-center gap-2">
      <Avatar name={comment.author.name} className="size-8 bg-offwhite!" />
      <p className="text-[15px] text-surface">
        <strong className="font-semibold">{toHandle(comment.author.name)}</strong> {comment.body}
      </p>
    </div>
  )
}

/** Um comentário com suas respostas (um nível, como a API). `onReply` só existe para usuários logados. */
export default function CommentItem({ comment, onReply }) {
  const [showReplies, setShowReplies] = useState(false)
  const [replying, setReplying] = useState(false)
  const hasReplies = comment.replies.length > 0

  async function handleReply(body) {
    await onReply(comment.id, body)
    setReplying(false)
    setShowReplies(true)
  }

  return (
    <article className="flex flex-col gap-2">
      <CommentLine comment={comment} />
      {onReply && (
        <button type="button" onClick={() => setReplying((open) => !open)} aria-expanded={replying} className={`${action} self-start`}>
          Responder
        </button>
      )}
      {replying && (
        <CommentForm
          onSubmit={handleReply}
          label={`Responder a ${toHandle(comment.author.name)}`}
          submitLabel="Enviar resposta"
        />
      )}
      {hasReplies && (
        <button
          type="button"
          onClick={() => setShowReplies((open) => !open)}
          aria-expanded={showReplies}
          className="flex cursor-pointer items-center gap-2 self-start rounded text-[12.5px] text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-surface"
        >
          <span aria-hidden="true" className="h-px w-8 bg-surface" />
          {showReplies ? 'Ocultar respostas' : 'Ver respostas'}
        </button>
      )}
      {hasReplies && showReplies && (
        <ul className="flex flex-col gap-2 pl-10">
          {comment.replies.map((reply) => (
            <li key={reply.id}>
              <CommentLine comment={reply} />
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
