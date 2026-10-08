const variants = {
  solid: 'bg-brand text-petroleum hover:brightness-110',
  outline: 'border border-brand text-brand hover:bg-brand/10',
  neutral: 'border border-muted text-muted hover:bg-muted/10',
  dark: 'bg-surface text-brand hover:brightness-125',
}

export default function Button({
  as: Tag = 'button',
  variant = 'solid',
  children,
  icon,
  type = 'button',
  className = '',
  ...props
}) {
  // `type` só faz sentido em <button>; com `as={Link}` ele iria parar no <a>
  const buttonProps = Tag === 'button' ? { type } : {}

  return (
    <Tag
      className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-3 text-lg font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...buttonProps}
      {...props}
    >
      {children}
      {icon}
    </Tag>
  )
}
