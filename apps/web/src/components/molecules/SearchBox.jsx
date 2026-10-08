import { useEffect, useRef, useState } from 'react'
import Icon from '../atoms/Icon'

const DEBOUNCE_MS = 300

/** Campo de busca controlado pela página: `value` vem da URL e `onSearch` a atualiza. */
export default function SearchBox({ value = '', onSearch, placeholder = 'Digite o que você procura' }) {
  const [text, setText] = useState(value)
  const [lastValue, setLastValue] = useState(value)
  const onSearchRef = useRef(onSearch)

  useEffect(() => {
    onSearchRef.current = onSearch
  })

  // "Limpar tudo" e a navegação do histórico mudam o valor de fora
  if (value !== lastValue) {
    setLastValue(value)
    setText(value)
  }

  useEffect(() => {
    if (text === value) return
    const timer = setTimeout(() => onSearchRef.current(text.trim()), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [text, value])

  function handleSubmit(event) {
    event.preventDefault()
    if (text !== value) onSearch(text.trim())
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex items-center gap-4 rounded bg-surface px-4 py-2 text-light focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand"
    >
      <Icon name="search" className="size-8 shrink-0" />
      <input
        type="search"
        aria-label="Buscar posts"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[22px] text-light outline-none placeholder:text-light"
      />
    </form>
  )
}
