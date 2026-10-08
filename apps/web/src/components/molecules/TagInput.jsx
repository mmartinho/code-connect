import { useId, useState } from 'react'
import Input from '../atoms/Input'
import Label from '../atoms/Label'
import Tag from '../atoms/Tag'

const MAX_TAGS = 5

/** Enter ou vírgula adicionam a tag digitada; as sugestões entram com um clique. */
export default function TagInput({ label = 'Tags', tags, onChange, suggestions = [], max = MAX_TAGS }) {
  const id = useId()
  const [text, setText] = useState('')
  const full = tags.length >= max

  function add(name) {
    const tag = name.trim()
    if (!tag || full || tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) return
    onChange([...tags, tag])
  }

  function handleKeyDown(event) {
    if (event.key !== 'Enter' && event.key !== ',') return
    event.preventDefault() // Enter não deve enviar o formulário
    add(text)
    setText('')
  }

  const available = suggestions.filter((name) => !tags.some((tag) => tag.toLowerCase() === name.toLowerCase()))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          value={text}
          maxLength={40}
          disabled={full}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          aria-describedby={`${id}-hint`}
          placeholder={full ? `Máximo de ${max} tags` : 'Digite e pressione Enter'}
        />
        <p id={`${id}-hint`} className="text-[15px] text-muted">
          Até {max} tags.
        </p>
      </div>
      {(tags.length > 0 || available.length > 0) && (
        <div className="flex flex-wrap items-center gap-4">
          {tags.map((tag) => (
            <Tag key={tag} variant="active" onRemove={() => onChange(tags.filter((existing) => existing !== tag))}>
              {tag}
            </Tag>
          ))}
          {!full &&
            available.map((name) => (
              <Tag key={name} variant="suggestion" onClick={() => add(name)}>
                {name}
              </Tag>
            ))}
        </div>
      )}
    </div>
  )
}
