import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useAuth } from '../context/AuthContext'
import RequireAuth from './RequireAuth'

vi.mock('../context/AuthContext')

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/perfil']}>
      <Routes>
        <Route path="/login" element={<p>login page</p>} />
        <Route
          path="/perfil"
          element={
            <RequireAuth>
              <p>private page</p>
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('RequireAuth', () => {
  it('shows a loading state while the session is restored', () => {
    useAuth.mockReturnValue({ status: 'loading' })
    renderRoute()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando')
  })

  it('redirects anonymous users to the login', () => {
    useAuth.mockReturnValue({ status: 'anonymous' })
    renderRoute()

    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('renders the page for authenticated users', () => {
    useAuth.mockReturnValue({ status: 'authenticated' })
    renderRoute()

    expect(screen.getByText('private page')).toBeInTheDocument()
  })
})
