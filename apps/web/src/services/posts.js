import api from './api'

// Parâmetros vazios ficam fora da query string
function clean(params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ''))
}

export async function listPosts({ q, tags, sort, page, limit } = {}) {
  const { data } = await api.get('/posts', {
    params: clean({ q, tags: tags?.join(','), sort, page, limit }),
  })
  return data
}

export async function getPost(id) {
  const { data } = await api.get(`/posts/${id}`)
  return data
}

export async function createPost({ title, body, code, tags = [], thumbnail }) {
  const form = new FormData()
  form.append('title', title)
  form.append('body', body)
  if (code) form.append('code', code)
  tags.forEach((tag) => form.append('tags', tag))
  if (thumbnail) form.append('thumbnail', thumbnail)

  const { data } = await api.post('/posts', form)
  return data
}

export async function deletePost(id) {
  await api.delete(`/posts/${id}`)
}

export async function likePost(id) {
  await api.put(`/posts/${id}/likes/me`)
}

export async function unlikePost(id) {
  await api.delete(`/posts/${id}/likes/me`)
}

export async function listComments(postId) {
  const { data } = await api.get(`/posts/${postId}/comments`)
  return data
}

export async function createComment(postId, { body, parentId }) {
  const { data } = await api.post(`/posts/${postId}/comments`, { body, parentId })
  return data
}

export async function listTags(limit = 10) {
  const { data } = await api.get('/tags', { params: { limit } })
  return data
}
