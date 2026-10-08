import { getInitials, toHandle } from './text'

describe('getInitials', () => {
  it.each([
    ['julio', 'J'],
    ['gabriel_luz', 'GL'],
    ['marcela.lins', 'ML'],
    ['Ana Maria Souza', 'AM'],
    ['', ''],
  ])('builds the initials of "%s"', (name, initials) => {
    expect(getInitials(name)).toBe(initials)
  })
})

describe('toHandle', () => {
  it('prefixes single-word names with @', () => {
    expect(toHandle('marcela.lins')).toBe('@marcela.lins')
  })

  it('keeps full names as they are', () => {
    expect(toHandle('Ana Souza')).toBe('Ana Souza')
  })
})
