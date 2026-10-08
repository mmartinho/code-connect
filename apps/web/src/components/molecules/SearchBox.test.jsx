import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SearchBox from './SearchBox'

describe('SearchBox', () => {
  it('is a search landmark with the current value', () => {
    render(<SearchBox value="meta" onSearch={vi.fn()} />)

    expect(screen.getByRole('search')).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Buscar posts' })).toHaveValue('meta')
  })

  it('searches after the user stops typing', async () => {
    const onSearch = vi.fn()
    render(<SearchBox onSearch={onSearch} />)

    await userEvent.type(screen.getByRole('searchbox'), 'mandioca')

    expect(onSearch).not.toHaveBeenCalled()
    await waitFor(() => expect(onSearch).toHaveBeenCalledWith('mandioca'), { timeout: 1500 })
    expect(onSearch).toHaveBeenCalledTimes(1)
  })

  it('searches immediately on Enter', async () => {
    const onSearch = vi.fn()
    render(<SearchBox onSearch={onSearch} />)

    await userEvent.type(screen.getByRole('searchbox'), 'vento{Enter}')

    expect(onSearch).toHaveBeenCalledWith('vento')
  })

  it('follows the value when it is changed from outside', () => {
    const { rerender } = render(<SearchBox value="meta" onSearch={vi.fn()} />)

    rerender(<SearchBox value="" onSearch={vi.fn()} />)

    expect(screen.getByRole('searchbox')).toHaveValue('')
  })
})
