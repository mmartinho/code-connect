import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useAuth } from '../context/AuthContext'
import ProfilePage from './ProfilePage'

vi.mock('../context/AuthContext')

const user = { id: '1', name: 'Ana Silva', email: 'ana@email.com', createdAt: '2026-10-06T12:00:00.000Z' }

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/perfil']}>
      <Routes>
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/login" element={<p>login page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProfilePage', () => {
  it('shows the current user data', () => {
    useAuth.mockReturnValue({ user, logout: vi.fn() })
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Meu perfil' })).toBeInTheDocument()
    expect(screen.getByText('Ana Silva')).toBeInTheDocument()
    expect(screen.getByText('ana@email.com')).toBeInTheDocument()
    expect(screen.getByText(/outubro de 2026/)).toBeInTheDocument()
    expect(document.title).toBe('Perfil · Code Connect')
  })

  it('logs out and goes back to the login', async () => {
    const logout = vi.fn()
    useAuth.mockReturnValue({ user, logout })
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(logout).toHaveBeenCalled()
    expect(screen.getByText('login page')).toBeInTheDocument()
  })
})
