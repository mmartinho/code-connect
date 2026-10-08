import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import TagInput from './TagInput'

function Harness({ initial = [], suggestions }) {
  const [tags, setTags] = useState(initial)
  return <TagInput tags={tags} onChange={setTags} suggestions={suggestions} />
}

describe('TagInput', () => {
  it('adds a tag with Enter and clears the field', async () => {
    render(<Harness />)
    const input = screen.getByLabelText('Tags')

    await userEvent.type(input, 'React{Enter}')

    expect(screen.getByRole('button', { name: 'Remover filtro React' })).toBeInTheDocument()
    expect(input).toHaveValue('')
  })

  it('adds a tag with a comma', async () => {
    render(<Harness />)

    await userEvent.type(screen.getByLabelText('Tags'), 'Node,')

    expect(screen.getByRole('button', { name: 'Remover filtro Node' })).toBeInTheDocument()
  })

  it('ignores duplicates regardless of case', async () => {
    render(<Harness initial={['React']} />)

    await userEvent.type(screen.getByLabelText('Tags'), 'react{Enter}')

    expect(screen.getAllByRole('button', { name: /Remover filtro/ })).toHaveLength(1)
  })

  it('removes a tag', async () => {
    render(<Harness initial={['React', 'Node']} />)

    await userEvent.click(screen.getByRole('button', { name: 'Remover filtro React' }))

    expect(screen.queryByRole('button', { name: 'Remover filtro React' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remover filtro Node' })).toBeInTheDocument()
  })

  it('adds a suggestion on click and stops suggesting it', async () => {
    render(<Harness suggestions={['Front-end', 'Back-end']} />)

    await userEvent.click(screen.getByRole('button', { name: 'Front-end' }))

    expect(screen.getByRole('button', { name: 'Remover filtro Front-end' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Front-end' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Back-end' })).toBeInTheDocument()
  })

  it('does not accept more than 5 tags', async () => {
    render(<Harness initial={['a', 'b', 'c', 'd', 'e']} />)

    expect(screen.getByLabelText('Tags')).toBeDisabled()
  })
})
