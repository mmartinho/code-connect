import { Link } from 'react-router'

const variants = {
  default: 'text-sm text-offwhite underline underline-offset-2 hover:text-brand',
  accent: 'text-xl text-brand hover:underline',
}

export default function TextLink({ to, variant = 'default', children, className = '', ...props }) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  )
}
