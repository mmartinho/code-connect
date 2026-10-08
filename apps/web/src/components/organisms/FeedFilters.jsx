import Tag from '../atoms/Tag'
import SearchBox from '../molecules/SearchBox'

/** Busca por texto mais as tags: as selecionadas (removíveis) vêm antes das sugestões. */
export default function FeedFilters({ q, tags, suggestions, onSearch, onToggleTag, onClear }) {
  const available = suggestions.filter((name) => !tags.some((tag) => tag.toLowerCase() === name.toLowerCase()))
  const hasFilters = Boolean(q) || tags.length > 0

  return (
    <div className="flex flex-col gap-4">
      <SearchBox value={q} onSearch={onSearch} />
      <div className="flex items-center justify-between gap-4">
        <ul aria-label="Filtros por tag" className="flex flex-wrap items-center gap-4">
          {tags.map((tag) => (
            <li key={tag}>
              <Tag variant="active" onRemove={() => onToggleTag(tag)}>
                {tag}
              </Tag>
            </li>
          ))}
          {available.map((name) => (
            <li key={name}>
              <Tag variant="suggestion" onClick={() => onToggleTag(name)}>
                {name}
              </Tag>
            </li>
          ))}
        </ul>
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 cursor-pointer rounded text-lg text-muted hover:text-offwhite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Limpar tudo
          </button>
        )}
      </div>
    </div>
  )
}
