import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormField from './FormField'

describe('FormField', () => {
  it('renders an input reachable by its label', () => {
    render(<FormField label="Senha" type="password" />)

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
  })

  it('forwards input props such as onChange', async () => {
    const onChange = vi.fn()
    render(<FormField label="Email ou usuário" onChange={onChange} />)

    await userEvent.type(screen.getByLabelText('Email ou usuário'), 'a')

    expect(onChange).toHaveBeenCalled()
  })
})
