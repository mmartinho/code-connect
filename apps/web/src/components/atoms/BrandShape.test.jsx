import { render } from '@testing-library/react'
import BrandShape from './BrandShape'

describe('BrandShape', () => {
  it('renders a decorative svg hidden from assistive technology', () => {
    const { container } = render(<BrandShape className="w-40" />)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).toHaveClass('w-40')
  })
})
