import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import LoginForm from './LoginForm'

function renderForm(props) {
  return render(
    <MemoryRouter>
      <LoginForm {...props} />
    </MemoryRouter>,
  )
}

describe('LoginForm', () => {
  it('renders the login fields, remember-me, forgot password link and submit button', () => {
    renderForm()

    expect(screen.getByLabelText('Email ou usuário')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password')
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Esqueci a senha' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login' })).toHaveAttribute('type', 'submit')
  })

  it('submits the typed credentials', async () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit })

    await userEvent.type(screen.getByLabelText('Email ou usuário'), 'usuario123')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(onSubmit).toHaveBeenCalledWith({ login: 'usuario123', password: 'segredo', remember: true })
  })

  it('does not submit when required fields are empty', async () => {
    const onSubmit = vi.fn()
    renderForm({ onSubmit })

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('announces an error for each empty field and focuses the first one', async () => {
    renderForm()

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(screen.getAllByRole('alert')).toHaveLength(2)
    expect(screen.getByLabelText('Email ou usuário')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Email ou usuário')).toHaveFocus()
  })

  it('clears the errors once the form is valid', async () => {
    renderForm({ onSubmit: vi.fn() })

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    await userEvent.type(screen.getByLabelText('Email ou usuário'), 'usuario123')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('explains the required-field mark', () => {
    renderForm()

    expect(screen.getByText('* Campos obrigatórios')).toBeInTheDocument()
  })
})
