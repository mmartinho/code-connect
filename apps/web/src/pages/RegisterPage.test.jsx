import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useAuth } from '../context/AuthContext'
import RegisterPage from './RegisterPage'

vi.mock('../context/AuthContext')

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <Routes>
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/perfil" element={<p>profile page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ register: vi.fn().mockResolvedValue() })
  })

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

  async function fillAndSubmit() {
    await userEvent.type(screen.getByLabelText('Nome'), 'Ana Silva')
    await userEvent.type(screen.getByLabelText('Email'), 'ana@email.com')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo123')
    await userEvent.click(screen.getByRole('button', { name: 'Cadastrar' }))
  }

  it('registers with the typed data and goes to the profile', async () => {
    const register = vi.fn().mockResolvedValue()
    useAuth.mockReturnValue({ register })
    renderPage()

    await fillAndSubmit()

    expect(register).toHaveBeenCalledWith({
      name: 'Ana Silva',
      email: 'ana@email.com',
      password: 'segredo123',
      remember: false,
    })
    expect(await screen.findByText('profile page')).toBeInTheDocument()
  })

  it('shows the error when the email is already registered', async () => {
    const register = vi.fn().mockRejectedValue({ response: { status: 409 } })
    useAuth.mockReturnValue({ register })
    renderPage()

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent('Este email já está cadastrado.')
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cadastrar' })).toBeEnabled())
  })
})
