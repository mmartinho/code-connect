import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'

vi.mock('../../context/AuthContext')

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={['/perfil']}>
      <Sidebar />
      <Routes>
        <Route path="/feed" element={<p>feed page</p>} />
        <Route path="/perfil" element={<p>profile page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Sidebar', () => {
  it('links to the main areas', () => {
    useAuth.mockReturnValue({ status: 'anonymous', logout: vi.fn() })
    renderSidebar()

    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Publicar' })).toHaveAttribute('href', '/publicar')
    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('href', '/feed')
    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('href', '/perfil')
    expect(screen.getByRole('link', { name: 'Sobre nós' })).toHaveAttribute('href', '/sobre-nos')
    expect(screen.getByRole('link', { name: 'Code Connect' })).toHaveAttribute('href', '/feed')
  })

  it('marks the current page', () => {
    useAuth.mockReturnValue({ status: 'anonymous', logout: vi.fn() })
    renderSidebar()

    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute('aria-current', 'page')
  })

  it('offers "Login" to visitors', () => {
    useAuth.mockReturnValue({ status: 'anonymous', logout: vi.fn() })
    renderSidebar()

    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('button', { name: 'Sair' })).not.toBeInTheDocument()
  })

  it('offers "Sair" to logged-in users and goes back to the feed after logging out', async () => {
    const logout = vi.fn()
    useAuth.mockReturnValue({ status: 'authenticated', logout })
    renderSidebar()

    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(logout).toHaveBeenCalledOnce()
    expect(screen.getByText('feed page')).toBeInTheDocument()
  })
})
