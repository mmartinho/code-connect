import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentItem from './CommentItem'

const reply = { id: 'r1', body: 'Até que foi rápido, uns 3 dias!', author: { name: 'julio' }, replies: [] }
const comment = {
  id: 'c1',
  body: 'Quanto tempo você levou?',
  author: { name: 'gabriel_luz' },
  replies: [reply],
}

describe('CommentItem', () => {
  it('shows the author and the text', () => {
    render(<CommentItem comment={comment} />)

    expect(screen.getByText('@gabriel_luz')).toBeInTheDocument()
    expect(screen.getByText(/Quanto tempo você levou/)).toBeInTheDocument()
  })

  it('toggles the replies', async () => {
    render(<CommentItem comment={comment} />)
    expect(screen.queryByText(/uns 3 dias/)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ver respostas' }))
    expect(screen.getByText(/uns 3 dias/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar respostas' }))
    expect(screen.queryByText(/uns 3 dias/)).not.toBeInTheDocument()
  })

  it('has no replies toggle when there are none', () => {
    render(<CommentItem comment={{ ...comment, replies: [] }} />)

    expect(screen.queryByRole('button', { name: /respostas/ })).not.toBeInTheDocument()
  })

  it('hides "Responder" for visitors (no onReply)', () => {
    render(<CommentItem comment={comment} />)

    expect(screen.queryByRole('button', { name: 'Responder' })).not.toBeInTheDocument()
  })

  it('replies to the comment and reveals the replies', async () => {
    const onReply = vi.fn().mockResolvedValue()
    render(<CommentItem comment={comment} onReply={onReply} />)

    await userEvent.click(screen.getByRole('button', { name: 'Responder' }))
    await userEvent.type(screen.getByLabelText('Responder a @gabriel_luz'), 'Valeu!')
    await userEvent.click(screen.getByRole('button', { name: 'Enviar resposta' }))

    expect(onReply).toHaveBeenCalledWith('c1', 'Valeu!')
    expect(await screen.findByText(/uns 3 dias/)).toBeInTheDocument()
  })
})
