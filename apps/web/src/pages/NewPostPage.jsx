import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import PostForm from '../components/organisms/PostForm'
import AppTemplate from '../components/templates/AppTemplate'
import { getErrorMessage } from '../services/errors'
import { createPost, listTags } from '../services/posts'

export default function NewPostPage() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    listTags(8)
      .then((popular) => setSuggestions(popular.map((tag) => tag.name)))
      .catch(() => {}) // as sugestões são opcionais
  }, [])

  async function handleSubmit(values) {
    setSubmitting(true)
    setError('')
    try {
      const post = await createPost(values)
      navigate(`/posts/${post.id}`)
    } catch (err) {
      setError(getErrorMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <>
      <title>Novo projeto · Code Connect</title>
      <AppTemplate>
        <PostForm
          onSubmit={handleSubmit}
          onDiscard={() => navigate('/feed')}
          submitting={submitting}
          error={error}
          suggestions={suggestions}
        />
      </AppTemplate>
    </>
  )
}
