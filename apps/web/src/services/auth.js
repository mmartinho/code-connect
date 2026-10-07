import api from './api'

export async function createToken({ email, password }) {
  const { data } = await api.post('/auth/tokens', { email, password })
  return data
}

export async function createUser({ name, email, password }) {
  const { data } = await api.post('/users', { name, email, password })
  return data
}

export async function getCurrentUser() {
  const { data } = await api.get('/users/me')
  return data
}
