import { useState } from 'react'
import { getErrorMessage } from '../../services/errors'
import Alert from '../atoms/Alert'
import Button from '../atoms/Button'
import Icon from '../atoms/Icon'
import Tag from '../atoms/Tag'
import AuthorBadge from '../molecules/AuthorBadge'
import PostActions from '../molecules/PostActions'
import PostThumbnail from '../molecules/PostThumbnail'

/** Só o autor vê "Excluir" (`post.canDelete` vem da API); a exclusão pede confirmação. */
export default function PostDetail({ post, canInteract, onLike, onDelete }) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      await onDelete()
    } catch (err) {
      setError(getErrorMessage(err))
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <article className="flex flex-col">
        <PostThumbnail src={post.thumbnailUrl} code={post.code} variant="detail" />
        <div className="flex flex-col gap-4 rounded-b-lg bg-surface p-4">
          <div className="flex flex-col gap-2 text-light">
            <h1 className="text-[22px] font-semibold">{post.title}</h1>
            <p className="text-[15px] whitespace-pre-line">{post.body}</p>
          </div>
          {post.tags.length > 0 && (
            <ul aria-label="Tags" className="flex flex-wrap gap-2.5">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Tag>{tag}</Tag>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-between">
            <PostActions
              likesCount={post.likesCount}
              commentsCount={post.commentsCount}
              liked={post.likedByMe}
              canInteract={canInteract}
              onLike={onLike}
              shareUrl={window.location.href.split('#')[0]}
              commentsHref="#comentarios"
            />
            <AuthorBadge name={post.author.name} />
          </div>
          {post.canDelete && (
            <div className="flex flex-col gap-3 border-t border-muted/30 pt-4">
              {confirming ? (
                <div role="group" aria-label="Confirmar exclusão" className="flex flex-col gap-3">
                  <p className="text-[15px] text-light">Excluir este post? Esta ação não pode ser desfeita.</p>
                  <div className="flex gap-4">
                    <Button variant="neutral" onClick={() => setConfirming(false)} disabled={deleting} className="px-4 py-2 text-[15px]">
                      Cancelar
                    </Button>
                    <Button variant="outline" onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-[15px]">
                      {deleting ? 'Excluindo…' : 'Confirmar exclusão'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setConfirming(true)}
                  icon={<Icon name="delete" />}
                  className="w-auto! self-start px-4 py-2 text-[15px]"
                >
                  Excluir post
                </Button>
              )}
              <Alert>{error}</Alert>
            </div>
          )}
        </div>
      </article>
      {post.code && (
        <section aria-labelledby="codigo-titulo" className="flex flex-col gap-2">
          <h2 id="codigo-titulo" className="text-[22px] font-semibold text-muted">
            Código:
          </h2>
          <pre
            tabIndex={0}
            className="overflow-x-auto rounded-lg bg-surface p-4 font-mono text-[15px] text-light shadow-[0_8px_12px_rgba(0,0,0,0.24)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            <code>{post.code}</code>
          </pre>
        </section>
      )}
    </div>
  )
}
