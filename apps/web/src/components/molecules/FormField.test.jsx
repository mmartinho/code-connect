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

  it('announces the error and links it to the input', () => {
    render(<FormField label="Senha" error="Informe a sua senha." />)

    const input = screen.getByLabelText('Senha')

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Informe a sua senha.')
    expect(input).toHaveAccessibleDescription('Informe a sua senha.')
  })

  it('renders a textarea when multiline', () => {
    render(<FormField label="Descrição" multiline rows={8} />)

    const field = screen.getByLabelText('Descrição')
    expect(field.tagName).toBe('TEXTAREA')
    expect(field).toHaveAttribute('rows', '8')
  })

  it('has no error state by default', () => {
    render(<FormField label="Senha" />)

    expect(screen.getByLabelText('Senha')).not.toHaveAttribute('aria-invalid')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
