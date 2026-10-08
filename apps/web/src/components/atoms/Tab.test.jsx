import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tab from './Tab'

describe('Tab', () => {
  it('marks the active tab as selected and underlined', () => {
    render(<Tab active>Recentes</Tab>)

    const tab = screen.getByRole('tab', { name: 'Recentes' })
    expect(tab).toHaveAttribute('aria-selected', 'true')
    expect(tab).toHaveClass('underline')
  })

  it('renders an inactive tab that can be clicked', async () => {
    const onClick = vi.fn()
    render(<Tab onClick={onClick}>Populares</Tab>)

    const tab = screen.getByRole('tab', { name: 'Populares' })
    expect(tab).toHaveAttribute('aria-selected', 'false')
    await userEvent.click(tab)

    expect(onClick).toHaveBeenCalledOnce()
  })
})
