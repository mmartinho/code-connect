import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FeedFilters from './FeedFilters'

function renderFilters(props) {
  const handlers = { onSearch: vi.fn(), onToggleTag: vi.fn(), onClear: vi.fn() }
  render(<FeedFilters q="" tags={[]} suggestions={[]} {...handlers} {...props} />)
  return { ...handlers, ...props }
}

describe('FeedFilters', () => {
  it('renders the search box', () => {
    renderFilters()

    expect(screen.getByRole('searchbox', { name: 'Buscar posts' })).toBeInTheDocument()
  })

  it('lists the selected tags as removable and the others as suggestions', async () => {
    const { onToggleTag } = renderFilters({ tags: ['Front-end'], suggestions: ['Front-end', 'React'] })

    expect(screen.getByRole('button', { name: 'Remover filtro Front-end' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Front-end' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'React' }))
    expect(onToggleTag).toHaveBeenCalledWith('React')

    await userEvent.click(screen.getByRole('button', { name: 'Remover filtro Front-end' }))
    expect(onToggleTag).toHaveBeenCalledWith('Front-end')
  })

  it('only offers "Limpar tudo" when something is filtered', async () => {
    const { rerender } = render(<FeedFilters q="" tags={[]} suggestions={[]} onSearch={vi.fn()} onToggleTag={vi.fn()} onClear={vi.fn()} />)
    expect(screen.queryByRole('button', { name: 'Limpar tudo' })).not.toBeInTheDocument()

    const onClear = vi.fn()
    rerender(<FeedFilters q="meta" tags={[]} suggestions={[]} onSearch={vi.fn()} onToggleTag={vi.fn()} onClear={onClear} />)
    await userEvent.click(screen.getByRole('button', { name: 'Limpar tudo' }))

    expect(onClear).toHaveBeenCalledOnce()
  })
})
