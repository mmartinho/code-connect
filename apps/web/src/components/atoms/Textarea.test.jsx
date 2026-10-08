import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Textarea from './Textarea'

describe('Textarea', () => {
  it('accepts typed text', async () => {
    render(<Textarea aria-label="Descrição" />)

    await userEvent.type(screen.getByLabelText('Descrição'), 'olá')

    expect(screen.getByLabelText('Descrição')).toHaveValue('olá')
  })

  it('forwards rows and invalid state', () => {
    render(<Textarea aria-label="Descrição" rows={8} aria-invalid="true" />)

    expect(screen.getByLabelText('Descrição')).toHaveAttribute('rows', '8')
    expect(screen.getByLabelText('Descrição')).toBeInvalid()
  })
})
