import { act, render, renderHook, waitFor } from '@testing-library/react'
import * as authService from '../services/auth'
import { getToken, setToken } from '../services/tokenStorage'
import { AuthProvider, useAuth } from './AuthContext'

vi.mock('../services/auth')

const user = { id: '1', name: 'Ana', email: 'ana@email.com', createdAt: '2026-10-06T12:00:00.000Z' }
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    vi.resetAllMocks()
  })

  it('is anonymous without a stored token', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.status).toBe('anonymous')
    expect(authService.getCurrentUser).not.toHaveBeenCalled()
  })

  it('restores the session from a stored token', async () => {
    setToken('abc')
    authService.getCurrentUser.mockResolvedValue(user)

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.status).toBe('loading')

    await waitFor(() => expect(result.current.status).toBe('authenticated'))
    expect(result.current.user).toEqual(user)
  })

  it('discards an invalid stored token', async () => {
    setToken('abc')
    authService.getCurrentUser.mockRejectedValue(new Error('401'))

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('anonymous'))
    expect(getToken()).toBeNull()
  })

  it('logs in, storing the token and loading the user', async () => {
    authService.createToken.mockResolvedValue({ accessToken: 'tok' })
    authService.getCurrentUser.mockResolvedValue(user)
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(() => result.current.login({ email: user.email, password: 'secret123', remember: true }))

    expect(localStorage.getItem('code-connect.token')).toBe('tok')
    expect(result.current.status).toBe('authenticated')
    expect(result.current.user).toEqual(user)
  })

  it('keeps the user anonymous when the login fails', async () => {
    authService.createToken.mockRejectedValue(new Error('401'))
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await expect(result.current.login({ email: 'a@b.co', password: 'x' })).rejects.toThrow()
    })

    expect(result.current.status).toBe('anonymous')
  })

  it('registers and then logs in', async () => {
    authService.createUser.mockResolvedValue(user)
    authService.createToken.mockResolvedValue({ accessToken: 'tok' })
    authService.getCurrentUser.mockResolvedValue(user)
    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(() => result.current.register({ name: 'Ana', email: user.email, password: 'secret123', remember: false }))

    expect(authService.createUser).toHaveBeenCalledWith({ name: 'Ana', email: user.email, password: 'secret123' })
    expect(authService.createToken).toHaveBeenCalledWith({ email: user.email, password: 'secret123' })
    expect(result.current.status).toBe('authenticated')
  })

  it('logs out', async () => {
    setToken('abc')
    authService.getCurrentUser.mockResolvedValue(user)
    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.status).toBe('authenticated'))

    act(() => result.current.logout())

    expect(result.current.status).toBe('anonymous')
    expect(result.current.user).toBeNull()
    expect(getToken()).toBeNull()
  })

  it('throws when used outside the provider', () => {
    function Probe() {
      useAuth()
      return null
    }
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Probe />)).toThrow(/AuthProvider/)
  })
})
