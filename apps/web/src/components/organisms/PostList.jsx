import Alert from '../atoms/Alert'
import Button from '../atoms/Button'
import PostCard from './PostCard'

export default function PostList({ posts, status, error, hasMore, loadingMore, onLoadMore, canInteract, onLike }) {
  if (status === 'loading') {
    return (
      <p role="status" className="text-center text-lg text-muted">
        Carregando posts…
      </p>
    )
  }

  if (status === 'error') return <Alert className="text-center text-lg">{error}</Alert>

  if (posts.length === 0) {
    return <p className="text-center text-lg text-muted">Nenhum post encontrado.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <ul className="grid gap-6 md:grid-cols-2">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} canInteract={canInteract} onLike={onLike} />
          </li>
        ))}
      </ul>
      {hasMore && (
        <Button variant="outline" onClick={onLoadMore} disabled={loadingMore} className="mx-auto w-auto! px-8">
          {loadingMore ? 'Carregando…' : 'Carregar mais'}
        </Button>
      )}
    </div>
  )
}
