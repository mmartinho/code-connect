import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useAuth } from '../context/AuthContext'
import GuestOnly from './GuestOnly'

vi.mock('../context/AuthContext')

function renderRoute() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/feed" element={<p>feed page</p>} />
        <Route
          path="/login"
          element={
            <GuestOnly>
              <p>login page</p>
            </GuestOnly>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('GuestOnly', () => {
  it('shows a loading state while the session is restored', () => {
    useAuth.mockReturnValue({ status: 'loading' })
    renderRoute()

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders the page for anonymous users', () => {
    useAuth.mockReturnValue({ status: 'anonymous' })
    renderRoute()

    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('redirects authenticated users to the feed', () => {
    useAuth.mockReturnValue({ status: 'authenticated' })
    renderRoute()

    expect(screen.getByText('feed page')).toBeInTheDocument()
  })
})
