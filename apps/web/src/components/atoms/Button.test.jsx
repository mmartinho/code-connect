import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
})
