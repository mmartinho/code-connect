import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CommentForm from './CommentForm'

describe('CommentForm', () => {
  it('keeps the submit button disabled while the text is empty', async () => {
    render(<CommentForm onSubmit={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Comentar' })).toBeDisabled()

    await userEvent.type(screen.getByLabelText('Escreva um comentário'), 'oi')

    expect(screen.getByRole('button', { name: 'Comentar' })).toBeEnabled()
  })

  it('submits the trimmed text and clears the field', async () => {
    const onSubmit = vi.fn().mockResolvedValue()
    render(<CommentForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Escreva um comentário'), '  Muito bom!  ')
    await userEvent.click(screen.getByRole('button', { name: 'Comentar' }))

    expect(onSubmit).toHaveBeenCalledWith('Muito bom!')
    expect(screen.getByLabelText('Escreva um comentário')).toHaveValue('')
  })

  it('shows the error and keeps the text when submitting fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue({ response: { status: 403 } })
    render(<CommentForm onSubmit={onSubmit} label="Responder" submitLabel="Responder" />)

    await userEvent.type(screen.getByLabelText('Responder'), 'oi')
    await userEvent.click(screen.getByRole('button', { name: 'Responder' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Você não tem permissão')
    expect(screen.getByLabelText('Responder')).toHaveValue('oi')
  })
})
