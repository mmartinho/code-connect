import { render, screen } from '@testing-library/react'
import Logo from './Logo'

describe('Logo', () => {
  it('renders the Code Connect logo as a single labelled image', () => {
    render(<Logo />)

    const logo = screen.getByRole('img', { name: 'Code Connect' })
    const parts = logo.querySelectorAll('img')

    expect(parts).toHaveLength(3)
    expect(parts[2]).toHaveAttribute('src', '/logo/wordmark.svg')
  })
})
