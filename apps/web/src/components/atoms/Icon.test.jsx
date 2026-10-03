import { render, screen } from '@testing-library/react'
import Icon from './Icon'

describe('Icon', () => {
  it('is hidden from assistive technology when it has no title', () => {
    const { container } = render(<Icon name="arrow-right" />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('path')).toBeInTheDocument()
  })

  it('is exposed as an image when it has a title', () => {
    render(<Icon name="clipboard" title="Cadastro" />)

    expect(screen.getByRole('img', { name: 'Cadastro' })).toBeInTheDocument()
  })
})
