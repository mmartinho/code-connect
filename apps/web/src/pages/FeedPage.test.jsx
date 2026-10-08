import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { likePost, listPosts, listTags, unlikePost } from '../services/posts'
import FeedPage from './FeedPage'

vi.mock('../context/AuthContext')
vi.mock('../services/posts')

const makePost = (id, overrides = {}) => ({
  id,
  title: `Post ${id}`,
  excerpt: 'texto',
  thumbnailUrl: null,
  tags: ['React'],
  author: { id: 'u1', name: 'julio' },
  likesCount: 2,
  commentsCount: 1,
  likedByMe: false,
  ...overrides,
})

function renderPage(url = '/feed') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <FeedPage />
    </MemoryRouter>,
  )
}

const lastCall = () => listPosts.mock.calls.at(-1)[0]

describe('FeedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth.mockReturnValue({ status: 'anonymous', logout: vi.fn() })
    listPosts.mockResolvedValue({ data: [makePost('a'), makePost('b')], meta: { total: 2 } })
    listTags.mockResolvedValue([{ name: 'React' }, { name: 'Front-end' }])
  })

  it('shows the posts for visitors, who cannot like', async () => {
    renderPage()

    expect(await screen.findByRole('link', { name: 'Post a' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Post b' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /curtir/i })[0]).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
    expect(document.title).toBe('Feed · Code Connect')
  })

  it('fetches the first page, most recent first', async () => {
    renderPage()
    await screen.findByRole('link', { name: 'Post a' })

    expect(lastCall()).toEqual({ q: '', tags: [], sort: 'recent', page: 1, limit: 6 })
    expect(screen.getByRole('tab', { name: 'Recentes' })).toHaveAttribute('aria-selected', 'true')
  })

  it('reads the filters from the URL', async () => {
    renderPage('/feed?q=meta&tags=React,Front-end&sort=popular')
    await screen.findByRole('link', { name: 'Post a' })

    expect(lastCall()).toMatchObject({ q: 'meta', tags: ['React', 'Front-end'], sort: 'popular' })
    expect(screen.getByRole('searchbox')).toHaveValue('meta')
    expect(screen.getByRole('tab', { name: 'Populares' })).toHaveAttribute('aria-selected', 'true')
  })

  it('searches on the server with the typed text', async () => {
    renderPage()
    await screen.findByRole('link', { name: 'Post a' })

    await userEvent.type(screen.getByRole('searchbox'), 'mandioca{Enter}')

    await waitFor(() => expect(lastCall()).toMatchObject({ q: 'mandioca', page: 1 }))
  })

  it('switches the order with the tabs', async () => {
    renderPage()
    await screen.findByRole('link', { name: 'Post a' })

    await userEvent.click(screen.getByRole('tab', { name: 'Populares' }))

    await waitFor(() => expect(lastCall()).toMatchObject({ sort: 'popular' }))
    expect(screen.getByRole('tab', { name: 'Populares' })).toHaveAttribute('aria-selected', 'true')
  })

  it('filters by tag and clears everything', async () => {
    renderPage()
    await screen.findByRole('link', { name: 'Post a' })

    await userEvent.click(await screen.findByRole('button', { name: 'Front-end' }))
    await waitFor(() => expect(lastCall()).toMatchObject({ tags: ['Front-end'] }))
    expect(screen.getByRole('button', { name: 'Remover filtro Front-end' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Limpar tudo' }))
    await waitFor(() => expect(lastCall()).toMatchObject({ tags: [], q: '' }))
  })

  it('shows an empty state when nothing matches', async () => {
    listPosts.mockResolvedValue({ data: [], meta: { total: 0 } })
    renderPage('/feed?q=nada')

    expect(await screen.findByText('Nenhum post encontrado.')).toBeInTheDocument()
  })

  it('shows the error when loading fails', async () => {
    listPosts.mockRejectedValue(new Error('Network Error'))
    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent('conectar ao servidor')
  })

  it('loads the next page and appends it', async () => {
    listPosts
      .mockResolvedValueOnce({ data: [makePost('a')], meta: { total: 2 } })
      .mockResolvedValueOnce({ data: [makePost('b')], meta: { total: 2 } })
    renderPage()
    await screen.findByRole('link', { name: 'Post a' })

    await userEvent.click(screen.getByRole('button', { name: 'Carregar mais' }))

    expect(await screen.findByRole('link', { name: 'Post b' })).toBeInTheDocument()
    expect(lastCall()).toMatchObject({ page: 2 })
    expect(screen.getByRole('link', { name: 'Post a' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Carregar mais' })).not.toBeInTheDocument()
  })

  it('waits for the session to be restored before fetching', async () => {
    useAuth.mockReturnValue({ status: 'loading', logout: vi.fn() })
    renderPage()

    expect(listPosts).not.toHaveBeenCalled()
  })

  describe('when logged in', () => {
    beforeEach(() => {
      useAuth.mockReturnValue({ status: 'authenticated', logout: vi.fn() })
      likePost.mockResolvedValue()
      unlikePost.mockResolvedValue()
    })

    it('likes optimistically', async () => {
      renderPage()
      const card = (await screen.findByRole('link', { name: 'Post a' })).closest('article')

      await userEvent.click(within(card).getByRole('button', { name: /curtir/i }))

      expect(likePost).toHaveBeenCalledWith('a')
      expect(within(card).getByRole('button', { name: /descurtir/i })).toHaveTextContent('3')
    })

    it('unlikes a post that was already liked', async () => {
      listPosts.mockResolvedValue({ data: [makePost('a', { likedByMe: true })], meta: { total: 1 } })
      renderPage()

      await userEvent.click(await screen.findByRole('button', { name: /descurtir/i }))

      expect(unlikePost).toHaveBeenCalledWith('a')
      expect(screen.getByRole('button', { name: /curtir/i })).toHaveTextContent('1')
    })

    it('rolls the like back and explains when the API refuses', async () => {
      likePost.mockRejectedValue({ response: { status: 401 } })
      renderPage()
      const card = (await screen.findByRole('link', { name: 'Post a' })).closest('article')

      await userEvent.click(within(card).getByRole('button', { name: /curtir/i }))

      expect(await screen.findByRole('alert')).toBeInTheDocument()
      expect(within(card).getByRole('button', { name: /curtir/i })).toHaveTextContent('2')
    })

    it('shows "Sair" in the menu', async () => {
      renderPage()
      await screen.findByRole('link', { name: 'Post a' })

      expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument()
    })
  })
})
