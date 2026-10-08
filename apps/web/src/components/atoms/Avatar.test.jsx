import { render, screen } from '@testing-library/react'
import Avatar from './Avatar'

describe('Avatar', () => {
  it('shows the initials of the name, hidden from assistive technology', () => {
    render(<Avatar name="Marcela Lins" />)

    expect(screen.getByText('ML')).toHaveAttribute('aria-hidden', 'true')
  })

  it('accepts a custom size', () => {
    render(<Avatar name="julio" className="size-10" />)

    expect(screen.getByText('J')).toHaveClass('size-10')
  })
})
