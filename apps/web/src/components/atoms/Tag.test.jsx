import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Tag from './Tag'

describe('Tag', () => {
  it('renders a static tag as plain text', () => {
    render(<Tag>React</Tag>)

    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onClick for a suggestion', async () => {
    const onClick = vi.fn()
    render(
      <Tag variant="suggestion" onClick={onClick}>
        React
      </Tag>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'React' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('lets an active tag be removed with an accessible button', async () => {
    const onRemove = vi.fn()
    render(
      <Tag variant="active" onRemove={onRemove}>
        Front-end
      </Tag>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Remover filtro Front-end' }))

    expect(onRemove).toHaveBeenCalledOnce()
  })
})
