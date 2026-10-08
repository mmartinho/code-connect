/**
 * Turns free text into a MySQL BOOLEAN MODE expression: every term is
 * required and matched by prefix (`dobr` finds "dobrar"). Operators are
 * stripped so user input cannot break the query.
 * Note: InnoDB ignores terms shorter than innodb_ft_min_token_size (3).
 */
export function toBooleanSearch(text: string): string | null {
  const terms = text
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((term) => term.length >= 3);
  if (terms.length === 0) return null;
  return terms.map((term) => `+${term}*`).join(' ');
}
