const KEY = 'code-connect.token'

export function getToken() {
  return localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY)
}

// "Lembrar-me" mantém a sessão entre visitas; sem ele, ela dura só enquanto a aba estiver aberta
export function setToken(token, remember = false) {
  clearToken()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(KEY, token)
}

export function clearToken() {
  localStorage.removeItem(KEY)
  sessionStorage.removeItem(KEY)
}
