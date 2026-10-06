import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterForm from './RegisterForm'

describe('RegisterForm', () => {
  it('renders the sign-up fields, remember-me and submit button', () => {
    render(<RegisterForm />)

    expect(screen.getByLabelText('Nome')).toHaveAttribute('placeholder', 'Nome completo')
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email')
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toHaveAttribute('type', 'submit')
  })

  it('submits the typed data', async () => {
    const onSubmit = vi.fn()
    render(<RegisterForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Nome'), 'Ana Silva')
    await userEvent.type(screen.getByLabelText('Email'), 'ana@email.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ana Silva',
      email: 'ana@email.com',
      password: 'segredo',
      remember: true,
    })
  })

  it('does not submit when required fields are empty', async () => {
    const onSubmit = vi.fn()
    render(<RegisterForm onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('announces an error for each empty field and focuses the first one', async () => {
    render(<RegisterForm />)

    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(screen.getAllByRole('alert')).toHaveLength(3)
    expect(screen.getByLabelText('Nome')).toHaveFocus()
  })

  it('rejects an invalid email', async () => {
    const onSubmit = vi.fn()
    render(<RegisterForm onSubmit={onSubmit} />)

    await userEvent.type(screen.getByLabelText('Nome'), 'Ana Silva')
    await userEvent.type(screen.getByLabelText('Email'), 'ana@')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Informe um email válido')
    expect(screen.getByLabelText('Email')).toHaveFocus()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
