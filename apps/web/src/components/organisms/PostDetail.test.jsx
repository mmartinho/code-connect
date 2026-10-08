import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import PostDetail from './PostDetail'

const post = {
  id: 'p1',
  title: 'Temos que estocar vento',
  body: 'A ideia de armazenar uma energia que não se guarda.',
  code: 'const estoque = []',
  thumbnailUrl: null,
  tags: ['Back-end'],
  author: { id: 'u1', name: 'julio' },
  likesCount: 3,
  commentsCount: 1,
  likedByMe: false,
  canDelete: false,
}

function renderDetail(props) {
  return render(
    <MemoryRouter>
      <PostDetail post={post} canInteract onLike={vi.fn()} onDelete={vi.fn()} {...props} />
    </MemoryRouter>,
  )
}

describe('PostDetail', () => {
  it('shows the post, its tags and the code block', () => {
    renderDetail()

    expect(screen.getByRole('heading', { level: 1, name: 'Temos que estocar vento' })).toBeInTheDocument()
    expect(screen.getByText(/energia que não se guarda/)).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Tags' })).toHaveTextContent('Back-end')
    expect(screen.getByRole('heading', { name: 'Código:' })).toBeInTheDocument()
    expect(screen.getByText('const estoque = []', { selector: 'code' })).toBeInTheDocument()
  })

  it('omits the code block when the post has no code', () => {
    renderDetail({ post: { ...post, code: null } })

    expect(screen.queryByRole('heading', { name: 'Código:' })).not.toBeInTheDocument()
  })

  it('hides "Excluir post" from anyone but the author', () => {
    renderDetail()

    expect(screen.queryByRole('button', { name: 'Excluir post' })).not.toBeInTheDocument()
  })

  it('asks for confirmation before deleting', async () => {
    const onDelete = vi.fn().mockResolvedValue()
    renderDetail({ post: { ...post, canDelete: true }, onDelete })

    await userEvent.click(screen.getByRole('button', { name: 'Excluir post' }))
    expect(onDelete).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))
    expect(onDelete).toHaveBeenCalledOnce()
  })

  it('lets the author cancel the deletion', async () => {
    const onDelete = vi.fn()
    renderDetail({ post: { ...post, canDelete: true }, onDelete })

    await userEvent.click(screen.getByRole('button', { name: 'Excluir post' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.getByRole('button', { name: 'Excluir post' })).toBeInTheDocument()
    expect(onDelete).not.toHaveBeenCalled()
  })

  it('shows the error when the deletion fails', async () => {
    const onDelete = vi.fn().mockRejectedValue({ response: { status: 403 } })
    renderDetail({ post: { ...post, canDelete: true }, onDelete })

    await userEvent.click(screen.getByRole('button', { name: 'Excluir post' }))
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Você não tem permissão')
  })

  it('likes the post', async () => {
    const onLike = vi.fn()
    renderDetail({ onLike })

    await userEvent.click(screen.getByRole('button', { name: /curtir/i }))

    expect(onLike).toHaveBeenCalledOnce()
  })
})
