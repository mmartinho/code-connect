/** Iniciais para o avatar: "marcela.lins" → "ML", "Ana Maria Souza" → "AM". */
export function getInitials(name = '') {
  const words = name.replace(/[^\p{L}\p{N}\s._-]/gu, '').split(/[\s._-]+/).filter(Boolean)
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/** "julio" → "@julio"; nomes com espaço ("Ana Souza") não viram @handle. */
export function toHandle(name) {
  return /\s/.test(name) ? name : `@${name}`
}
