import { NavLink } from 'react-router'
import Icon from '../atoms/Icon'

const base =
  'flex flex-col items-center gap-1 rounded px-2 py-2 text-center text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand lg:gap-2 lg:px-4 lg:text-[22px]'

/** Com `to` vira um link (marcado com aria-current na página atual); com `onClick`, um botão. */
export default function NavItem({ icon, children, to, onClick }) {
  const content = (
    <>
      <Icon name={icon} className="size-6 lg:size-8" />
      {children}
    </>
  )

  if (to) {
    return (
      <NavLink to={to} className={({ isActive }) => `${base} ${isActive ? 'text-white' : 'text-muted hover:text-offwhite'}`}>
        {content}
      </NavLink>
    )
  }

  return (
    <button type="button" onClick={onClick} className={`${base} cursor-pointer text-muted hover:text-offwhite`}>
      {content}
    </button>
  )
}
