import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import Alert from '../components/atoms/Alert'
import TextLink from '../components/atoms/TextLink'
import CommentSection from '../components/organisms/CommentSection'
import PostDetail from '../components/organisms/PostDetail'
import AppTemplate from '../components/templates/AppTemplate'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/errors'
import { createComment, deletePost, getPost, likePost, listComments, unlikePost } from '../services/posts'

export default function PostDetailPage() {
  const { id } = useParams()
  const { status: authStatus } = useAuth()
  const navigate = useNavigate()
  const { hash } = useLocation()
  const canInteract = authStatus === 'authenticated'

  // Cada resultado guarda o id que o gerou: enquanto não bate com a URL, está "carregando"
  const [loaded, setLoaded] = useState({ key: null, post: null, error: '' })
  const status = loaded.key !== id ? 'loading' : loaded.error ? 'error' : 'ready'
  const { post } = loaded
  const [comments, setComments] = useState({ key: null, items: [], error: '' })
  const commentsStatus = comments.key !== id ? 'loading' : comments.error ? 'error' : 'ready'
  const [actionError, setActionError] = useState('')

  const loadComments = useCallback(async () => {
    try {
      setComments({ key: id, items: await listComments(id), error: '' })
    } catch (err) {
      setComments({ key: id, items: [], error: getErrorMessage(err) })
    }
  }, [id])

  // Espera a sessão ser restaurada para já receber likedByMe/canDelete
  useEffect(() => {
    if (authStatus === 'loading') return
    let cancelled = false
    getPost(id)
      .then((data) => {
        if (!cancelled) setLoaded({ key: id, post: data, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setLoaded({ key: id, post: null, error: getErrorMessage(err) })
      })
    listComments(id)
      .then((items) => {
        if (!cancelled) setComments({ key: id, items, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setComments({ key: id, items: [], error: getErrorMessage(err) })
      })
    return () => {
      cancelled = true
    }
  }, [id, authStatus])

  // O navegador não rola até #comentarios porque o conteúdo chega depois
  useEffect(() => {
    if (status === 'ready' && hash) document.getElementById(hash.slice(1))?.scrollIntoView?.()
  }, [status, hash])

  function updatePost(changes) {
    setLoaded((current) => ({ ...current, post: changes(current.post) }))
  }

  async function handleLike() {
    const liked = !post.likedByMe
    const apply = (value) =>
      updatePost((current) => ({ ...current, likedByMe: value, likesCount: current.likesCount + (value ? 1 : -1) }))
    apply(liked)
    setActionError('')
    try {
      await (liked ? likePost : unlikePost)(id)
    } catch (err) {
      apply(!liked)
      setActionError(getErrorMessage(err))
    }
  }

  async function handleComment(body, parentId) {
    await createComment(id, { body, parentId })
    updatePost((current) => ({ ...current, commentsCount: current.commentsCount + 1 }))
    await loadComments()
  }

  async function handleDelete() {
    await deletePost(id)
    navigate('/feed', { replace: true })
  }

  return (
    <>
      <title>{post ? `${post.title} · Code Connect` : 'Post · Code Connect'}</title>
      <AppTemplate>
        {status === 'loading' && (
          <p role="status" className="text-center text-lg text-muted">
            Carregando post…
          </p>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <Alert className="text-lg">{loaded.error}</Alert>
            <TextLink to="/feed" variant="accent">
              Voltar ao feed
            </TextLink>
          </div>
        )}
        {status === 'ready' && (
          <div className="flex flex-col gap-10">
            <PostDetail post={post} canInteract={canInteract} onLike={handleLike} onDelete={handleDelete} />
            <Alert>{actionError}</Alert>
            <CommentSection
              comments={comments.items}
              status={commentsStatus}
              error={comments.error}
              canComment={canInteract}
              onComment={(body) => handleComment(body)}
              onReply={(parentId, body) => handleComment(body, parentId)}
            />
          </div>
        )}
      </AppTemplate>
    </>
  )
}
