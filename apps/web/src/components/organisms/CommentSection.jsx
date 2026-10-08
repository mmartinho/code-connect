import { Link } from 'react-router'
import Alert from '../atoms/Alert'
import CommentForm from '../molecules/CommentForm'
import CommentItem from '../molecules/CommentItem'

/** Visitantes leem os comentários, mas só quem está logado comenta e responde. */
export default function CommentSection({ comments, status, error, canComment, onComment, onReply }) {
  return (
    <section id="comentarios" aria-labelledby="comentarios-titulo" className="flex scroll-mt-6 flex-col gap-6 rounded-lg bg-muted px-4 py-8">
      <h2 id="comentarios-titulo" className="text-[22px] font-semibold text-surface">
        Comentários
      </h2>
      {canComment ? (
        <CommentForm onSubmit={onComment} />
      ) : (
        <p className="text-[15px] text-surface">
          <Link to="/login" className="font-semibold underline">
            Faça login
          </Link>{' '}
          para comentar.
        </p>
      )}
      {status === 'loading' && (
        <p role="status" className="text-[15px] text-surface">
          Carregando comentários…
        </p>
      )}
      {status === 'error' && <Alert className="text-surface!">{error}</Alert>}
      {status === 'ready' && comments.length === 0 && <p className="text-[15px] text-surface">Seja o primeiro a comentar.</p>}
      {comments.length > 0 && (
        <ul className="flex flex-col gap-4">
          {comments.map((comment) => (
            <li key={comment.id} className="border-surface/40 not-first:border-t not-first:pt-4">
              <CommentItem comment={comment} onReply={canComment ? onReply : undefined} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
