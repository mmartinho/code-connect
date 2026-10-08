import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext'
import Button from '../atoms/Button'
import Logo from '../atoms/Logo'
import NavItem from '../molecules/NavItem'

/**
 * Menu principal: coluna lateral no desktop e barra fixa no rodapé no mobile.
 * O último item reflete a sessão: "Sair" quando logado, "Login" quando não.
 */
export default function Sidebar() {
  const { status, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/feed', { replace: true })
  }

  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around gap-1 bg-surface px-2 py-2 lg:static lg:w-[177px] lg:shrink-0 lg:flex-col lg:justify-start lg:gap-20 lg:self-stretch lg:rounded-lg lg:px-4 lg:py-10"
    >
      <Link to="/feed" className="hidden rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:block">
        <Logo />
      </Link>
      <div className="flex w-full items-center justify-around gap-1 lg:flex-col lg:gap-10">
        <Button as={Link} to="/publicar" variant="outline" className="w-auto! px-3 py-2 text-[15px] lg:w-full! lg:px-4 lg:py-3 lg:text-[22px] lg:font-normal">
          Publicar
        </Button>
        <NavItem icon="feed" to="/feed">
          Feed
        </NavItem>
        <NavItem icon="account-circle" to="/perfil">
          Perfil
        </NavItem>
        <NavItem icon="info" to="/sobre-nos">
          Sobre nós
        </NavItem>
        {status === 'authenticated' ? (
          <NavItem icon="logout" onClick={handleLogout}>
            Sair
          </NavItem>
        ) : (
          <NavItem icon="login" to="/login">
            Login
          </NavItem>
        )}
      </div>
    </nav>
  )
}
