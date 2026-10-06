import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import LoginPage from './LoginPage'

function renderPage(props) {
  return render(
    <MemoryRouter>
      <LoginPage {...props} />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('renders the login layout with banner, form, social login and sign-up link', () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Login' })).toBeInTheDocument()
    expect(screen.getByText('Boas-vindas! Faça seu login.')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /pessoa programando/i })).toHaveAttribute('src', '/banner-login.webp')
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar com Github' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crie seu cadastro!' })).toHaveAttribute('href', '/cadastro')
    expect(document.title).toBe('Login · Code Connect')
  })

  it('forwards the submitted credentials to onLogin', async () => {
    const onLogin = vi.fn()
    renderPage({ onLogin })

    await userEvent.type(screen.getByLabelText('Email ou usuário'), 'usuario123')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    expect(onLogin).toHaveBeenCalledWith({ login: 'usuario123', password: 'segredo', remember: false })
  })
})
