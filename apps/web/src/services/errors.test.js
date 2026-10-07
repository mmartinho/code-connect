import { getErrorMessage } from './errors'

const httpError = (status, data) => ({ response: { status, data } })

describe('getErrorMessage', () => {
  it('explains a network failure', () => {
    expect(getErrorMessage(new Error('Network Error'))).toMatch(/conectar ao servidor/)
  })

  it('maps 401 and 409', () => {
    expect(getErrorMessage(httpError(401))).toBe('Email ou senha inválidos.')
    expect(getErrorMessage(httpError(409))).toBe('Este email já está cadastrado.')
  })

  it('joins the validation messages of a 422', () => {
    expect(getErrorMessage(httpError(422, { message: ['a', 'b'] }))).toBe('a b')
    expect(getErrorMessage(httpError(422, { message: 'single' }))).toBe('single')
  })

  it('falls back for other statuses', () => {
    expect(getErrorMessage(httpError(500))).toBe('Algo deu errado. Tente novamente.')
  })
})
