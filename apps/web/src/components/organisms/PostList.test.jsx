import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import PostList from './PostList'

const makePost = (id) => ({
  id,
  title: `Post ${id}`,
  excerpt: 'texto',
  thumbnailUrl: null,
  tags: [],
  author: { id: 'u', name: 'ana' },
  likesCount: 0,
  commentsCount: 0,
  likedByMe: false,
})

function renderList(props) {
  return render(
    <MemoryRouter>
      <PostList posts={[]} status="ready" canInteract onLike={vi.fn()} onLoadMore={vi.fn()} {...props} />
    </MemoryRouter>,
  )
}

describe('PostList', () => {
  it('shows a loading state', () => {
    renderList({ status: 'loading' })

    expect(screen.getByRole('status')).toHaveTextContent('Carregando posts')
  })

  it('shows the error', () => {
    renderList({ status: 'error', error: 'Algo deu errado.' })

    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado.')
  })

  it('shows an empty state', () => {
    renderList({ posts: [] })

    expect(screen.getByText('Nenhum post encontrado.')).toBeInTheDocument()
  })

  it('renders one card per post', () => {
    renderList({ posts: [makePost('a'), makePost('b')] })

    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'Post a' })).toBeInTheDocument()
  })

  it('offers "Carregar mais" only when there is another page', async () => {
    const onLoadMore = vi.fn()
    const { unmount } = renderList({ posts: [makePost('a')], hasMore: true, onLoadMore })

    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))
    expect(onLoadMore).toHaveBeenCalledOnce()

    unmount()
    renderList({ posts: [makePost('a')], hasMore: false })
    expect(screen.queryByRole('button', { name: 'Carregar mais' })).not.toBeInTheDocument()
  })

  it('disables the button while loading more', () => {
    renderList({ posts: [makePost('a')], hasMore: true, loadingMore: true })

    expect(screen.getByRole('button', { name: 'Carregando…' })).toBeDisabled()
  })
})
