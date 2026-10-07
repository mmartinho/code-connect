import { useNavigate } from 'react-router'
import Button from '../components/atoms/Button'
import Heading from '../components/atoms/Heading'
import Logo from '../components/atoms/Logo'
import { useAuth } from '../context/AuthContext'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' })

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <title>Perfil · Code Connect</title>
      <main className="flex min-h-screen items-center justify-center bg-page p-6">
        <section className="flex w-full max-w-[420px] flex-col gap-8 rounded-2xl bg-surface p-8">
          <Logo />
          <Heading>Meu perfil</Heading>
          <dl className="flex flex-col gap-4 text-offwhite">
            <div>
              <dt className="text-[15px] text-muted">Nome</dt>
              <dd className="text-lg">{user.name}</dd>
            </div>
            <div>
              <dt className="text-[15px] text-muted">Email</dt>
              <dd className="text-lg">{user.email}</dd>
            </div>
            <div>
              <dt className="text-[15px] text-muted">Membro desde</dt>
              <dd className="text-lg">{dateFormatter.format(new Date(user.createdAt))}</dd>
            </div>
          </dl>
          <Button onClick={handleLogout}>Sair</Button>
        </section>
      </main>
    </>
  )
}
