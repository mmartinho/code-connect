import { render, screen } from '@testing-library/react'
import Divider from './Divider'

describe('Divider', () => {
  it('renders its text between the lines', () => {
    render(<Divider>ou entre com outras contas</Divider>)

    expect(screen.getByText('ou entre com outras contas')).toBeInTheDocument()
  })

  it('renders only the lines when it has no text', () => {
    const { container } = render(<Divider />)

    expect(container.firstChild.children).toHaveLength(2)
  })
})
