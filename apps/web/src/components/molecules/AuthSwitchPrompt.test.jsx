import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import AuthSwitchPrompt from './AuthSwitchPrompt'

describe('AuthSwitchPrompt', () => {
  it('renders the question and a link to the other auth page', () => {
    render(
      <MemoryRouter>
        <AuthSwitchPrompt question="Ainda não tem conta?" linkText="Crie seu cadastro!" to="/cadastro" icon="clipboard" />
      </MemoryRouter>,
    )

    expect(screen.getByText('Ainda não tem conta?')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Crie seu cadastro!' })).toHaveAttribute('href', '/cadastro')
  })

  it('places the question and the link side by side in the inline layout', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthSwitchPrompt question="Já tem conta?" linkText="Faça seu login!" to="/login" icon="login" layout="inline" />
      </MemoryRouter>,
    )

    expect(container.firstChild).toHaveClass('md:flex-row')
    expect(screen.getByRole('link', { name: 'Faça seu login!' })).toHaveAttribute('href', '/login')
  })
})
