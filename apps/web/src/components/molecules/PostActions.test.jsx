import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import PostActions from './PostActions'

function renderActions(props) {
  return render(
    <MemoryRouter>
      <PostActions likesCount={12} commentsCount={3} {...props} />
    </MemoryRouter>,
  )
}

describe('PostActions', () => {
  it('shows the counters', () => {
    renderActions({ canInteract: true })

    expect(screen.getByRole('button', { name: /curtir/i })).toHaveTextContent('12')
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('likes when the user is logged in', async () => {
    const onLike = vi.fn()
    renderActions({ canInteract: true, onLike })

    await userEvent.click(screen.getByRole('button', { name: /curtir/i }))

    expect(onLike).toHaveBeenCalledOnce()
  })

  it('reflects a post the user already liked', () => {
    renderActions({ canInteract: true, liked: true })

    expect(screen.getByRole('button', { name: /descurtir/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('does not let visitors like and explains why', async () => {
    const onLike = vi.fn()
    renderActions({ canInteract: false, onLike })

    const like = screen.getByRole('button', { name: /curtir/i })
    await userEvent.click(like)

    expect(like).toHaveAttribute('aria-disabled', 'true')
    expect(like).toHaveAttribute('title', 'Faça login para curtir')
    expect(onLike).not.toHaveBeenCalled()
  })

  it('copies the share url to the clipboard and confirms', async () => {
    const user = userEvent.setup()
    renderActions({ canInteract: false, shareUrl: 'http://localhost/posts/1' })

    await user.click(screen.getByRole('button', { name: /compartilhar/i }))

    expect(await navigator.clipboard.readText()).toBe('http://localhost/posts/1')
    expect(await screen.findByText('Link copiado')).toBeInTheDocument()
  })

  it('links the comments counter to the comments section', () => {
    renderActions({ commentsHref: '/posts/1#comentarios' })

    expect(screen.getByRole('link', { name: /comentários/i })).toHaveAttribute('href', '/posts/1#comentarios')
  })
})
