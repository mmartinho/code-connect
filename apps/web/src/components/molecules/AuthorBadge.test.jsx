import { render, screen } from '@testing-library/react'
import AuthorBadge from './AuthorBadge'

describe('AuthorBadge', () => {
  it('shows the author as a handle next to the avatar', () => {
    render(<AuthorBadge name="julio" />)

    expect(screen.getByText('@julio')).toBeInTheDocument()
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  it('keeps full names as they are', () => {
    render(<AuthorBadge name="Ana Souza" />)

    expect(screen.getByText('Ana Souza')).toBeInTheDocument()
  })
})
