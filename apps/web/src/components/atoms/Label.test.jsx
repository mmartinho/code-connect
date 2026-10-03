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
})
