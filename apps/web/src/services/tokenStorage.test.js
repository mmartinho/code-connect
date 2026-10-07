import { clearToken, getToken, setToken } from './tokenStorage'

describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('keeps the token in localStorage when remember is true', () => {
    setToken('abc', true)

    expect(localStorage.getItem('code-connect.token')).toBe('abc')
    expect(sessionStorage.getItem('code-connect.token')).toBeNull()
    expect(getToken()).toBe('abc')
  })

  it('keeps the token in sessionStorage when remember is false', () => {
    setToken('abc', false)

    expect(sessionStorage.getItem('code-connect.token')).toBe('abc')
    expect(localStorage.getItem('code-connect.token')).toBeNull()
    expect(getToken()).toBe('abc')
  })

  it('replaces a previous token and clears both storages', () => {
    setToken('old', true)
    setToken('new', false)
    expect(localStorage.getItem('code-connect.token')).toBeNull()

    clearToken()
    expect(getToken()).toBeNull()
  })
})
