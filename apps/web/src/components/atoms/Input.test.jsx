import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Input from './Input'

describe('Input', () => {
  it('renders with the given placeholder and type', () => {
    render(<Input type="password" placeholder="******" />)

    expect(screen.getByPlaceholderText('******')).toHaveAttribute('type', 'password')
  })

  it('accepts typed text', async () => {
    render(<Input aria-label="Usuário" />)

    await userEvent.type(screen.getByLabelText('Usuário'), 'usuario123')

    expect(screen.getByLabelText('Usuário')).toHaveValue('usuario123')
  })
})
