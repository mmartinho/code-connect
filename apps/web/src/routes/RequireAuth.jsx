import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function RequireAuth({ children }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <p role="status" className="p-8 text-offwhite">Carregando…</p>
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: location }} />
  return children
}
