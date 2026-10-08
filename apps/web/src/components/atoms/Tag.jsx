import Icon from './Icon'

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand'

/**
 * - `active`: filtro selecionado, com botão para remover (`onRemove`)
 * - `suggestion`: sugestão clicável (`onClick`)
 * - `static`: apenas exibe a tag, como nos cards
 */
export default function Tag({ children, variant = 'static', onClick, onRemove, className = '' }) {
  const base = 'inline-flex items-center gap-2.5 rounded px-2 py-1 text-lg'

  if (variant === 'active') {
    return (
      <span className={`${base} bg-muted text-surface ${className}`}>
        {children}
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remover filtro ${children}`}
          className={`flex cursor-pointer rounded ${focus}`}
        >
          <Icon name="close" className="size-[15px]" />
        </button>
      </span>
    )
  }

  if (variant === 'suggestion') {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} cursor-pointer bg-light text-surface hover:brightness-110 ${focus} ${className}`}
      >
        {children}
      </button>
    )
  }

  return <span className={`${base} bg-light text-surface ${className}`}>{children}</span>
}
