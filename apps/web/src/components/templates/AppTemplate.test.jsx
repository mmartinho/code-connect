import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import AppTemplate from './AppTemplate'

vi.mock('../../context/AuthContext')

describe('AppTemplate', () => {
  it('wraps the page content in the main landmark next to the menu', () => {
    useAuth.mockReturnValue({ status: 'anonymous', logout: vi.fn() })
    render(
      <MemoryRouter>
        <AppTemplate>
          <h1>Conteúdo da página</h1>
        </AppTemplate>
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { name: 'Conteúdo da página' }))
  })
})
