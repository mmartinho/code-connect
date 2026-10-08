import { useState } from 'react'
import { Link } from 'react-router'
import Icon from '../atoms/Icon'

const control =
  'flex flex-col items-center rounded text-[15px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

/**
 * Curtir e comentar exigem login: para visitantes ficam com aria-disabled
 * (e não `disabled`, que tiraria o botão da navegação por teclado).
 */
export default function PostActions({ likesCount, commentsCount, liked = false, canInteract = false, onLike, shareUrl, commentsHref }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // sem permissão para a área de transferência: nada a fazer
    }
  }

  const comments = (
    <>
      <Icon name="chat" />
      <span className="sr-only">Comentários</span>
      <span>{commentsCount}</span>
    </>
  )

  return (
    <div className="flex items-start gap-4 text-muted">
      <button
        type="button"
        onClick={canInteract ? onLike : undefined}
        aria-pressed={liked}
        aria-disabled={canInteract ? undefined : true}
        title={canInteract ? undefined : 'Faça login para curtir'}
        className={`${control} ${liked ? 'text-brand' : ''} ${canInteract ? 'cursor-pointer hover:text-offwhite' : 'cursor-not-allowed'}`}
      >
        <Icon name="code" />
        <span className="sr-only">{liked ? 'Descurtir' : 'Curtir'}</span>
        <span>{likesCount}</span>
      </button>
      {shareUrl && (
        <button type="button" onClick={handleShare} className={`${control} cursor-pointer hover:text-offwhite`}>
          <Icon name="share" />
          <span className="sr-only">Compartilhar</span>
          <span role="status" className="text-[12.5px]">
            {copied ? 'Link copiado' : ''}
          </span>
        </button>
      )}
      {commentsHref ? (
        <Link to={commentsHref} className={`${control} hover:text-offwhite`}>
          {comments}
        </Link>
      ) : (
        <span className={control}>{comments}</span>
      )}
    </div>
  )
}
