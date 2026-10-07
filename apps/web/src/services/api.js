import axios from 'axios'
import { clearToken, getToken } from './tokenStorage'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expirado ou inválido: descarta a sessão; quem chamou decide o redirecionamento
    if (error.response?.status === 401 && error.config?.headers?.Authorization) clearToken()
    return Promise.reject(error)
  },
)

export default api
