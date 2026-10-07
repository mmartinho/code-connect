import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useAuth } from '../context/AuthContext'
import LoginPage from './LoginPage'

vi.mock('../context/AuthContext')

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/perfil" element={<p>profile page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ login: vi.fn().mockResolvedValue() })
  })

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

  async function fillAndSubmit() {
    await userEvent.type(screen.getByLabelText('Email'), 'ana@email.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo123')
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
  }

  it('logs in with the typed credentials and goes to the profile', async () => {
    const login = vi.fn().mockResolvedValue()
    useAuth.mockReturnValue({ login })
    renderPage()

    await fillAndSubmit()

    expect(login).toHaveBeenCalledWith({ email: 'ana@email.com', password: 'segredo123', remember: false })
    expect(await screen.findByText('profile page')).toBeInTheDocument()
  })

  it('shows the error when the credentials are rejected', async () => {
    const login = vi.fn().mockRejectedValue({ response: { status: 401 } })
    useAuth.mockReturnValue({ login })
    renderPage()

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Email ou senha inválidos.')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled())
  })
})
