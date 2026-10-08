import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Link } from 'react-router'
import Button from './Button'

describe('Button', () => {
  it('renders its label as a non-submit button by default', () => {
    render(<Button>Login</Button>)

    expect(screen.getByRole('button', { name: 'Login' })).toHaveAttribute('type', 'button')
  })

  it('renders the icon next to the label', () => {
    render(<Button icon={<span data-testid="icon" />}>Login</Button>)

    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Login</Button>)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies the outline variant', () => {
    render(<Button variant="outline">Publicar</Button>)

    expect(screen.getByRole('button')).toHaveClass('border-brand')
  })

  it('applies the dark variant', () => {
    render(<Button variant="dark">Comentar</Button>)

    expect(screen.getByRole('button')).toHaveClass('bg-surface')
  })

  it('can render as a link without a button type', () => {
    render(
      <MemoryRouter>
        <Button as={Link} to="/publicar">
          Publicar
        </Button>
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Publicar' })
    expect(link).toHaveAttribute('href', '/publicar')
    expect(link).not.toHaveAttribute('type')
  })
})
