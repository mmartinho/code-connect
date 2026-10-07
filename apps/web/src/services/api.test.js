import api from './api'
import { getToken, setToken } from './tokenStorage'

function mockAdapter(status = 200) {
  const adapter = vi.fn((config) =>
    status < 400
      ? Promise.resolve({ data: {}, status, statusText: '', headers: {}, config })
      : Promise.reject(Object.assign(new Error('fail'), { config, response: { status, data: {}, config } })),
  )
  api.defaults.adapter = adapter
  return adapter
}

describe('api', () => {
  const originalAdapter = api.defaults.adapter

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    api.defaults.adapter = originalAdapter
  })

  it('sends the bearer token when there is one', async () => {
    setToken('abc')
    const adapter = mockAdapter()

    await api.get('/users/me')

    expect(adapter.mock.calls[0][0].headers.Authorization).toBe('Bearer abc')
  })

  it('sends no authorization header without a token', async () => {
    const adapter = mockAdapter()

    await api.get('/users/me')

    expect(adapter.mock.calls[0][0].headers.Authorization).toBeUndefined()
  })

  it('drops the token when the api answers 401', async () => {
    setToken('abc')
    mockAdapter(401)

    await expect(api.get('/users/me')).rejects.toBeDefined()

    expect(getToken()).toBeNull()
  })
})
