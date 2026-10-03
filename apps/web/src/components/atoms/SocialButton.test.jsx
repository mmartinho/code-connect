import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SocialButton from './SocialButton'

describe('SocialButton', () => {
  it('renders an accessible button with the provider logo', () => {
    const { container } = render(<SocialButton name="Github" logoSrc="/github.png" />)

    expect(screen.getByRole('button', { name: 'Entrar com Github' })).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', '/github.png')
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<SocialButton name="Gmail" logoSrc="/gmail.png" onClick={onClick} />)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledOnce()
  })
})
