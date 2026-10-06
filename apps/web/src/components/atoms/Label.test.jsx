import { render, screen } from '@testing-library/react'
import Label from './Label'

describe('Label', () => {
  it('labels the associated control', () => {
    render(
      <>
        <Label htmlFor="email">Email ou usuário</Label>
        <input id="email" />
      </>,
    )

    expect(screen.getByLabelText('Email ou usuário')).toHaveAttribute('id', 'email')
  })

  it('marks the label as required without changing its text', () => {
    render(
      <>
        <Label htmlFor="email" required>
          Email
        </Label>
        <input id="email" />
      </>,
    )

    expect(screen.getByText('Email')).toHaveClass("after:content-['*']")
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })
})
