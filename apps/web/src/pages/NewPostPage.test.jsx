import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { createPost, listTags } from '../services/posts'
import NewPostPage from './NewPostPage'

vi.mock('../context/AuthContext')
vi.mock('../services/posts')

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/publicar']}>
      <Routes>
        <Route path="/publicar" element={<NewPostPage />} />
        <Route path="/posts/:id" element={<p>post page</p>} />
        <Route path="/feed" element={<p>feed page</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

async function fillAndPublish() {
  await userEvent.type(screen.getByLabelText('Nome do projeto'), 'React zero to hero')
  await userEvent.type(screen.getByLabelText('Descrição'), 'Um projeto')
  await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))
}

describe('NewPostPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ status: 'authenticated', logout: vi.fn() })
    listTags.mockResolvedValue([{ name: 'React' }])
  })

  it('renders the form with tag suggestions', async () => {
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Novo projeto' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'React' })).toBeInTheDocument()
    expect(document.title).toBe('Novo projeto · Code Connect')
  })

  it('publishes and opens the new post', async () => {
    createPost.mockResolvedValue({ id: 'new-id' })
    renderPage()

    await fillAndPublish()

    expect(createPost).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'React zero to hero', body: 'Um projeto', tags: [] }),
    )
    expect(await screen.findByText('post page')).toBeInTheDocument()
  })

  it('shows the error and lets the user try again', async () => {
    createPost.mockRejectedValue({ response: { status: 422, data: { message: ['title too long'] } } })
    renderPage()

    await fillAndPublish()

    expect(await screen.findByText('title too long')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar' })).toBeEnabled()
  })

  it('goes back to the feed when discarding', async () => {
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }))

    expect(screen.getByText('feed page')).toBeInTheDocument()
  })
})
