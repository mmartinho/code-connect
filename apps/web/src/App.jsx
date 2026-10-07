import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import GuestOnly from './routes/GuestOnly'
import RequireAuth from './routes/RequireAuth'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/perfil" replace />} />
          <Route
            path="/login"
            element={
              <GuestOnly>
                <LoginPage />
              </GuestOnly>
            }
          />
          <Route
            path="/cadastro"
            element={
              <GuestOnly>
                <RegisterPage />
              </GuestOnly>
            }
          />
          <Route
            path="/perfil"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
