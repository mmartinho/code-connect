import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import TextLink from './TextLink'

function renderWithRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('TextLink', () => {
  it('renders a link to the given route', () => {
    renderWithRouter(<TextLink to="/esqueci-a-senha">Esqueci a senha</TextLink>)

    expect(screen.getByRole('link', { name: 'Esqueci a senha' })).toHaveAttribute('href', '/esqueci-a-senha')
  })

  it('applies the accent variant', () => {
    renderWithRouter(
      <TextLink to="/cadastro" variant="accent">
        Crie seu cadastro!
      </TextLink>,
    )

    expect(screen.getByRole('link')).toHaveClass('text-brand')
  })
})
