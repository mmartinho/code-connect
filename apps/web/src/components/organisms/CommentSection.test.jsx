import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import CommentSection from './CommentSection'

const comments = [
  { id: 'c1', body: 'Muito bom!', author: { name: 'marcia' }, replies: [] },
  { id: 'c2', body: 'Quanto tempo levou?', author: { name: 'gabriel_luz' }, replies: [] },
]

function renderSection(props) {
  return render(
    <MemoryRouter>
      <CommentSection comments={comments} status="ready" canComment onComment={vi.fn()} onReply={vi.fn()} {...props} />
    </MemoryRouter>,
  )
}

describe('CommentSection', () => {
  it('lists the comments under a "Comentários" heading', () => {
    renderSection()

    expect(screen.getByRole('heading', { name: 'Comentários' })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(2)
  })

  it('lets logged-in users comment', async () => {
    const onComment = vi.fn().mockResolvedValue()
    renderSection({ onComment })

    await userEvent.type(screen.getByLabelText('Escreva um comentário'), 'Show!')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(onComment).toHaveBeenCalledWith('Show!')
  })

  it('lets logged-in users reply', () => {
    renderSection()

    expect(screen.getAllByRole('button', { name: 'Responder' })).toHaveLength(2)
  })

  it('asks visitors to log in instead of showing the form and reply buttons', () => {
    renderSection({ canComment: false })

    expect(screen.queryByLabelText('Escreva um comentário')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Responder' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Faça login' })).toHaveAttribute('href', '/login')
    expect(screen.getByText('Muito bom!', { exact: false })).toBeInTheDocument()
  })

  it('shows the loading, error and empty states', () => {
    const { rerender } = renderSection({ status: 'loading', comments: [] })
    expect(screen.getByRole('status')).toHaveTextContent('Carregando comentários')

    rerender(
      <MemoryRouter>
        <CommentSection comments={[]} status="error" error="Falhou." canComment onComment={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Falhou.')

    rerender(
      <MemoryRouter>
        <CommentSection comments={[]} status="ready" canComment onComment={vi.fn()} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Seja o primeiro a comentar.')).toBeInTheDocument()
  })
})
