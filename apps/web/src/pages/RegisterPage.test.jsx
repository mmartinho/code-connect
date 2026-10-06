import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import RegisterPage from './RegisterPage'

function renderPage(props) {
  return render(
    <MemoryRouter>
      <RegisterPage {...props} />
    </MemoryRouter>,
  )
}

describe('RegisterPage', () => {
  it('renders the sign-up layout with banner, logo, form, social login and login link', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Cadastro' })).toBeInTheDocument()
    expect(screen.getByText('Olá! Preencha seus dados.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /pessoa de óculos/i })).toHaveAttribute('src', '/banner-cadastro.webp')
    expect(screen.getByRole('img', { name: 'Code Connect' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar com Gmail' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute('href', '/login')
    expect(document.title).toBe('Cadastro · Code Connect')
  })

  it('forwards the submitted data to onRegister', async () => {
    const onRegister = vi.fn()
    renderPage({ onRegister })

    await userEvent.type(screen.getByLabelText('Nome'), 'Ana Silva')
    await userEvent.type(screen.getByLabelText('Email'), 'ana@email.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))

    expect(onRegister).toHaveBeenCalledWith({
      name: 'Ana Silva',
      email: 'ana@email.com',
      password: 'segredo',
      remember: false,
    })
  })
})
