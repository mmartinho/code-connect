import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Checkbox from './Checkbox'

describe('Checkbox', () => {
  it('renders an unchecked checkbox with its label', () => {
    render(<Checkbox label="Lembrar-me" />)

    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).not.toBeChecked()
  })

  it('toggles when the label is clicked', async () => {
    render(<Checkbox label="Lembrar-me" />)

    await userEvent.click(screen.getByText('Lembrar-me'))

    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})
