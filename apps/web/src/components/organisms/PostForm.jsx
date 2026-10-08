import { useEffect, useRef, useState } from 'react'
import Alert from '../atoms/Alert'
import Button from '../atoms/Button'
import Heading from '../atoms/Heading'
import Icon from '../atoms/Icon'
import FormField from '../molecules/FormField'
import PostThumbnail from '../molecules/PostThumbnail'
import TagInput from '../molecules/TagInput'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 2 * 1024 * 1024

/** Formulário de "Novo projeto": a capa escolhida aparece em pré-visualização ao lado. */
export default function PostForm({ onSubmit, onDiscard, submitting = false, error, suggestions = [] }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [code, setCode] = useState('')
  const [tags, setTags] = useState([])
  const [thumbnail, setThumbnail] = useState(null)
  const [preview, setPreview] = useState(null)
  const [thumbnailError, setThumbnailError] = useState('')
  const [errors, setErrors] = useState({})
  const fileInput = useRef(null)

  // A URL de pré-visualização é criada ao escolher o arquivo e liberada ao trocar, remover ou sair
  const previewRef = useRef(null)
  useEffect(() => () => previewRef.current && URL.revokeObjectURL(previewRef.current), [])

  function selectThumbnail(file) {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = file ? URL.createObjectURL(file) : null
    setThumbnail(file)
    setPreview(previewRef.current)
  }

  function handleFile(event) {
    const file = event.target.files[0]
    event.target.value = '' // permite escolher o mesmo arquivo de novo depois de removê-lo
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_BYTES) {
      setThumbnailError('Use uma imagem JPG, PNG ou WebP de até 2 MB.')
      return
    }
    setThumbnailError('')
    selectThumbnail(file)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const found = {}
    if (!title.trim()) found.title = 'Informe o nome do projeto.'
    if (!body.trim()) found.body = 'Descreva o projeto.'
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.getElementById(found.title ? 'post-title' : 'post-body')?.focus()
      return
    }
    onSubmit({ title: title.trim(), body: body.trim(), code, tags, thumbnail })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 rounded-lg bg-surface p-4 md:flex-row md:p-8">
      <div className="flex flex-col gap-4 md:w-[486px] md:shrink-0">
        <div className="rounded-lg">
          <PostThumbnail src={preview} code={code} variant="detail" />
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="neutral" onClick={() => fileInput.current.click()} icon={<Icon name="upload" />}>
            Carregar imagem
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            onChange={handleFile}
            aria-label="Arquivo da imagem do projeto"
            tabIndex={-1}
            className="hidden"
          />
          {thumbnail && (
            <p className="flex items-center gap-2 text-[15px] text-muted">
              {thumbnail.name}
              <button
                type="button"
                onClick={() => selectThumbnail(null)}
                aria-label={`Remover imagem ${thumbnail.name}`}
                className="flex cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <Icon name="close" className="size-4" />
              </button>
            </p>
          )}
          <Alert>{thumbnailError}</Alert>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-10">
        <Heading as="h1" className="text-[26px]!">
          Novo projeto
        </Heading>
        <div className="flex flex-col gap-6">
          <FormField
            id="post-title"
            label="Nome do projeto"
            value={title}
            maxLength={120}
            error={errors.title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <FormField
            id="post-body"
            label="Descrição"
            multiline
            rows={6}
            value={body}
            error={errors.body}
            onChange={(event) => setBody(event.target.value)}
          />
          <FormField
            id="post-code"
            label="Código"
            multiline
            rows={6}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="font-mono"
            spellCheck={false}
          />
          <TagInput tags={tags} onChange={setTags} suggestions={suggestions} />
        </div>
        <Alert>{error}</Alert>
        <div className="flex gap-6">
          <Button variant="outline" onClick={onDiscard} disabled={submitting} icon={<Icon name="delete" />}>
            Descartar
          </Button>
          <Button type="submit" disabled={submitting} icon={<Icon name="publish" />}>
            {submitting ? 'Publicando…' : 'Publicar'}
          </Button>
        </div>
      </div>
    </form>
  )
}
