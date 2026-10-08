import { Navigate } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function GuestOnly({ children }) {
  const { status } = useAuth()

  if (status === 'loading') return <p role="status" className="p-8 text-offwhite">Carregando…</p>
  if (status === 'authenticated') return <Navigate to="/feed" replace />
  return children
}
