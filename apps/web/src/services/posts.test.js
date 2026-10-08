import api from './api'
import {
  createComment,
  createPost,
  deletePost,
  getPost,
  likePost,
  listComments,
  listPosts,
  listTags,
  unlikePost,
} from './posts'

vi.mock('./api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

describe('posts service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.get.mockResolvedValue({ data: 'result' })
    api.post.mockResolvedValue({ data: 'created' })
  })

  it('lists posts sending only the filled filters, tags comma-separated', async () => {
    await expect(listPosts({ q: 'meta', tags: ['react', 'front-end'], sort: 'popular', page: 2, limit: 6 })).resolves.toBe(
      'result',
    )

    expect(api.get).toHaveBeenCalledWith('/posts', {
      params: { q: 'meta', tags: 'react,front-end', sort: 'popular', page: 2, limit: 6 },
    })
  })

  it('omits empty filters', async () => {
    await listPosts({ q: '', tags: [], sort: 'recent' })

    expect(api.get).toHaveBeenCalledWith('/posts', { params: { sort: 'recent' } })
  })

  it('gets one post and its comments', async () => {
    await getPost('p1')
    await listComments('p1')

    expect(api.get).toHaveBeenCalledWith('/posts/p1')
    expect(api.get).toHaveBeenCalledWith('/posts/p1/comments')
  })

  it('creates a post as multipart form data', async () => {
    const thumbnail = new File(['x'], 'a.png', { type: 'image/png' })

    await expect(createPost({ title: 'T', body: 'B', code: 'c', tags: ['a', 'b'], thumbnail })).resolves.toBe('created')

    const form = api.post.mock.calls[0][1]
    expect(api.post.mock.calls[0][0]).toBe('/posts')
    expect(form.get('title')).toBe('T')
    expect(form.get('body')).toBe('B')
    expect(form.get('code')).toBe('c')
    expect(form.getAll('tags')).toEqual(['a', 'b'])
    expect(form.get('thumbnail').name).toBe('a.png')
  })

  it('does not send empty optional fields', async () => {
    await createPost({ title: 'T', body: 'B' })

    const form = api.post.mock.calls[0][1]
    expect(form.has('code')).toBe(false)
    expect(form.has('thumbnail')).toBe(false)
    expect(form.getAll('tags')).toEqual([])
  })

  it('likes, unlikes and deletes with the right verbs', async () => {
    await likePost('p1')
    await unlikePost('p1')
    await deletePost('p1')

    expect(api.put).toHaveBeenCalledWith('/posts/p1/likes/me')
    expect(api.delete).toHaveBeenCalledWith('/posts/p1/likes/me')
    expect(api.delete).toHaveBeenCalledWith('/posts/p1')
  })

  it('creates comments and replies', async () => {
    await createComment('p1', { body: 'oi', parentId: 'c1' })

    expect(api.post).toHaveBeenCalledWith('/posts/p1/comments', { body: 'oi', parentId: 'c1' })
  })

  it('lists the most used tags', async () => {
    await listTags(5)

    expect(api.get).toHaveBeenCalledWith('/tags', { params: { limit: 5 } })
  })
})
