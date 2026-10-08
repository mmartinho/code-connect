import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { createComment, deletePost, getPost, likePost, listComments, unlikePost } from '../services/posts'
import PostDetailPage from './PostDetailPage'

vi.mock('../context/AuthContext')
vi.mock('../services/posts')

const post = {
  id: 'p1',
  title: 'Temos que estocar vento',
  body: 'texto do post',
  code: 'const estoque = []',
  thumbnailUrl: null,
  tags: ['Back-end'],
  author: { id: 'u1', name: 'julio' },
  likesCount: 3,
  commentsCount: 1,
  likedByMe: false,
  canDelete: false,
}
const comments = [{ id: 'c1', body: 'Muito bom!', author: { name: 'marcia' }, replies: [] }]

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/posts/p1']}>
      <Routes>
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/feed" element={<p>feed page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PostDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ status: 'anonymous', logout: vi.fn() })
    getPost.mockResolvedValue(post)
    listComments.mockResolvedValue(comments)
  })

  it('shows the post and its comments to visitors, who can neither like nor comment', async () => {
    renderPage()

    expect(await screen.findByRole('heading', { level: 1, name: 'Temos que estocar vento' })).toBeInTheDocument()
    expect(await screen.findByText(/Muito bom!/)).toBeInTheDocument()
    expect(getPost).toHaveBeenCalledWith('p1')
    expect(document.title).toBe('Temos que estocar vento · Code Connect')
    expect(screen.getByRole('button', { name: /curtir/i })).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('link', { name: 'Faça login' })).toBeInTheDocument()
    expect(screen.queryByLabelText('Escreva um comentário')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Excluir post' })).not.toBeInTheDocument()
  })

  it('explains when the post does not exist', async () => {
    getPost.mockRejectedValue({ response: { status: 404 } })
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('Conteúdo não encontrado.')
    expect(screen.getByRole('link', { name: 'Voltar ao feed' })).toHaveAttribute('href', '/feed')
  })

  describe('when logged in', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ status: 'authenticated', logout: vi.fn() })
    })

    it('likes and unlikes', async () => {
      likePost.mockResolvedValue()
      unlikePost.mockResolvedValue()
      renderPage()

      await userEvent.click(await screen.findByRole('button', { name: /curtir/i }))
      expect(likePost).toHaveBeenCalledWith('p1')
      expect(screen.getByRole('button', { name: /descurtir/i })).toHaveTextContent('4')

      await userEvent.click(screen.getByRole('button', { name: /descurtir/i }))
      expect(unlikePost).toHaveBeenCalledWith('p1')
    })

    it('comments and reloads the comments', async () => {
      createComment.mockResolvedValue({})
      renderPage()
      await screen.findByText(/Muito bom!/)

      await userEvent.type(screen.getByLabelText('Escreva um comentário'), 'Show!')
      await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

      expect(createComment).toHaveBeenCalledWith('p1', { body: 'Show!', parentId: undefined })
      expect(listComments).toHaveBeenCalledTimes(2)
    })

    it('replies to a comment', async () => {
      createComment.mockResolvedValue({})
      renderPage()
      await screen.findByText(/Muito bom!/)

      await userEvent.click(screen.getByRole('button', { name: 'Responder' }))
      await userEvent.type(screen.getByLabelText('Responder a @marcia'), 'Valeu!')
      await userEvent.click(screen.getByRole('button', { name: 'Enviar resposta' }))

      expect(createComment).toHaveBeenCalledWith('p1', { body: 'Valeu!', parentId: 'c1' })
    })

    it('hides "Excluir post" from users who are not the author', async () => {
      renderPage()
      await screen.findByRole('heading', { level: 1 })

      expect(screen.queryByRole('button', { name: 'Excluir post' })).not.toBeInTheDocument()
    })

    it('lets the author delete the post and goes back to the feed', async () => {
      getPost.mockResolvedValue({ ...post, canDelete: true })
      deletePost.mockResolvedValue()
      renderPage()

      await userEvent.click(await screen.findByRole('button', { name: 'Excluir post' }))
      await userEvent.click(screen.getByRole('button', { name: 'Confirmar exclusão' }))

      expect(deletePost).toHaveBeenCalledWith('p1')
      expect(await screen.findByText('feed page')).toBeInTheDocument()
    })
  })
})
