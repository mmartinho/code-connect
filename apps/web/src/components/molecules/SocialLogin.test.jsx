import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SocialLogin from './SocialLogin'

describe('SocialLogin', () => {
  it('renders the divider text and a button per provider', () => {
    render(<SocialLogin />)

    expect(screen.getByText('ou entre com outras contas')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar com Github' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar com Gmail' })).toBeInTheDocument()
  })

  it('calls onSelect with the chosen provider id', async () => {
    const onSelect = vi.fn()
    render(<SocialLogin onSelect={onSelect} />)

    await userEvent.click(screen.getByRole('button', { name: 'Entrar com Gmail' }))

    expect(onSelect).toHaveBeenCalledWith('gmail')
  })
})
