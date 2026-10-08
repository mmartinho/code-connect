import { useState } from 'react'
import { getErrorMessage } from '../../services/errors'
import Alert from '../atoms/Alert'
import Button from '../atoms/Button'
import Textarea from '../atoms/Textarea'

/** Usado para comentar e para responder; `onSubmit` recebe o texto e devolve uma Promise. */
export default function CommentForm({ onSubmit, label = 'Escreva um comentário', submitLabel = 'Comentar' }) {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const text = body.trim()
    if (!text) return
    setSubmitting(true)
    setError('')
    try {
      await onSubmit(text)
      setBody('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea
        aria-label={label}
        rows={3}
        maxLength={1000}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        className="bg-light!"
      />
      <Alert className="text-surface!">{error}</Alert>
      <Button type="submit" variant="dark" disabled={submitting || !body.trim()} className="w-auto! self-end px-6 py-2 text-[15px]">
        {submitLabel}
      </Button>
    </form>
  )
}
