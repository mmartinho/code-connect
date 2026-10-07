import api from './api'
import { createToken, createUser, getCurrentUser } from './auth'

describe('auth service', () => {
  afterEach(() => vi.restoreAllMocks())

  it('creates a token with email and password', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { accessToken: 't' } })

    await expect(createToken({ email: 'a@b.co', password: 'secret123' })).resolves.toEqual({ accessToken: 't' })
    expect(post).toHaveBeenCalledWith('/auth/tokens', { email: 'a@b.co', password: 'secret123' })
  })

  it('creates a user without extra fields', async () => {
    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: { id: '1' } })

    await createUser({ name: 'Ana', email: 'a@b.co', password: 'secret123', remember: true })

    expect(post).toHaveBeenCalledWith('/users', { name: 'Ana', email: 'a@b.co', password: 'secret123' })
  })

  it('fetches the current user', async () => {
    const get = vi.spyOn(api, 'get').mockResolvedValue({ data: { id: '1' } })

    await expect(getCurrentUser()).resolves.toEqual({ id: '1' })
    expect(get).toHaveBeenCalledWith('/users/me')
  })
})
