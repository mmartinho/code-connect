import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import PostCard from './PostCard'

const post = {
  id: 'p1',
  title: 'Quero saudar a mandioca',
  excerpt: 'Uma das saudações mais lembradas.',
  thumbnailUrl: null,
  tags: ['Front-end', 'React'],
  author: { id: 'u1', name: 'julio' },
  likesCount: 4,
  commentsCount: 2,
  likedByMe: false,
}

function renderCard(props) {
  return render(
    <MemoryRouter>
      <PostCard post={post} canInteract onLike={vi.fn()} {...props} />
    </MemoryRouter>,
  )
}

describe('PostCard', () => {
  it('shows the post summary and links to the details', () => {
    renderCard()

    expect(screen.getByRole('link', { name: 'Quero saudar a mandioca' })).toHaveAttribute('href', '/posts/p1')
    expect(screen.getByText('Uma das saudações mais lembradas.')).toBeInTheDocument()
    expect(screen.getByText('@julio')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Tags' })).toHaveTextContent('Front-endReact')
  })

  it('shows the placeholder when the post has no thumbnail', () => {
    renderCard()

    expect(screen.getByTestId('thumbnail-placeholder')).toBeInTheDocument()
  })

  it('shows the thumbnail when the post has one', () => {
    const { container } = renderCard({ post: { ...post, thumbnailUrl: 'http://x/a.png' } })

    expect(container.querySelector('img')).toHaveAttribute('src', 'http://x/a.png')
  })

  it('links the comments counter to the comments of the post', () => {
    renderCard()

    expect(screen.getByRole('link', { name: /comentários/i })).toHaveAttribute('href', '/posts/p1#comentarios')
  })

  it('likes the post for logged-in users', async () => {
    const onLike = vi.fn()
    renderCard({ onLike })

    await userEvent.click(screen.getByRole('button', { name: /curtir/i }))

    expect(onLike).toHaveBeenCalledWith(post)
  })

  it('does not let visitors like', async () => {
    const onLike = vi.fn()
    renderCard({ canInteract: false, onLike })

    await userEvent.click(screen.getByRole('button', { name: /curtir/i }))

    expect(onLike).not.toHaveBeenCalled()
  })
})
