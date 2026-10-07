import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { createToken, createUser, getCurrentUser } from '../services/auth'
import { clearToken, getToken, setToken } from '../services/tokenStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(() => (getToken() ? 'loading' : 'anonymous'))

  useEffect(() => {
    if (status !== 'loading') return
    let cancelled = false
    getCurrentUser()
      .then((currentUser) => {
        if (cancelled) return
        setUser(currentUser)
        setStatus('authenticated')
      })
      .catch(() => {
        if (cancelled) return
        clearToken()
        setStatus('anonymous')
      })
    return () => {
      cancelled = true
    }
  }, [status])

  const login = useCallback(async ({ email, password, remember }) => {
    const { accessToken } = await createToken({ email, password })
    setToken(accessToken, remember)
    try {
      setUser(await getCurrentUser())
    } catch (error) {
      clearToken()
      throw error
    }
    setStatus('authenticated')
  }, [])

  const register = useCallback(
    async ({ name, email, password, remember }) => {
      await createUser({ name, email, password })
      await login({ email, password, remember })
    },
    [login],
  )

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo(() => ({ user, status, login, register, logout }), [user, status, login, register, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// oxlint-disable-next-line react/only-export-components -- o hook pertence ao mesmo módulo do contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
