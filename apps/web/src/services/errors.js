const FALLBACK = 'Algo deu errado. Tente novamente.'

export function getErrorMessage(error) {
  const response = error?.response
  if (!response) return 'Não foi possível conectar ao servidor. Tente novamente.'

  switch (response.status) {
    case 401:
      return 'Email ou senha inválidos.'
    case 409:
      return 'Este email já está cadastrado.'
    case 422: {
      const { message } = response.data ?? {}
      return Array.isArray(message) ? message.join(' ') : (message ?? FALLBACK)
    }
    default:
      return FALLBACK
  }
}
