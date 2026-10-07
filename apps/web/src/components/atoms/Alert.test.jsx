import { render, screen } from '@testing-library/react'
import Alert from './Alert'

describe('Alert', () => {
  it('announces its message', () => {
    render(<Alert>Algo deu errado.</Alert>)

    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado.')
  })

  it('renders nothing without a message', () => {
    render(<Alert />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
