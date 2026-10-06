import { emailMessage, focusFirstInvalid, hasErrors, requiredMessage } from './validation'

describe('validation', () => {
  it('requires a non-blank value', () => {
    expect(requiredMessage('  ', 'Obrigatório')).toBe('Obrigatório')
    expect(requiredMessage('Ana', 'Obrigatório')).toBeUndefined()
  })

  it('asks for an email and checks its format', () => {
    expect(emailMessage('')).toBe('Informe o seu email.')
    expect(emailMessage('ana@')).toMatch(/email válido/)
    expect(emailMessage('ana@email.com')).toBeUndefined()
  })

  it('detects whether any error is set', () => {
    expect(hasErrors({ a: undefined, b: undefined })).toBe(false)
    expect(hasErrors({ a: undefined, b: 'erro' })).toBe(true)
  })

  it('focuses the first field that has an error', () => {
    document.body.innerHTML = '<form><input name="a" /><input name="b" /><input name="c" /></form>'
    const form = document.querySelector('form')

    focusFirstInvalid(form, { b: 'erro', c: 'erro' })

    expect(document.activeElement).toBe(form.elements.b)
  })
})
