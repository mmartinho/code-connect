import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import NavItem from './NavItem'

describe('NavItem', () => {
  it('renders a link to the given route', () => {
    render(
      <MemoryRouter>
        <NavItem icon="feed" to="/feed">
          Feed
        </NavItem>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('href', '/feed')
  })

  it('marks the link of the current page', () => {
    render(
      <MemoryRouter initialEntries={['/feed']}>
        <NavItem icon="feed" to="/feed">
          Feed
        </NavItem>
        <NavItem icon="account-circle" to="/perfil">
          Perfil
        </NavItem>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Feed' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Perfil' })).not.toHaveAttribute('aria-current')
  })

  it('renders a button when it has an action instead of a route', async () => {
    const onClick = vi.fn()
    render(
      <NavItem icon="logout" onClick={onClick}>
        Sair
      </NavItem>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Sair' }))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
