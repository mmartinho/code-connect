import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostForm from './PostForm'

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview')
  URL.revokeObjectURL = vi.fn()
})

function renderForm(props) {
  const handlers = { onSubmit: vi.fn(), onDiscard: vi.fn() }
  const { container } = render(<PostForm {...handlers} {...props} />)
  return { ...handlers, container, fileInput: () => container.querySelector('input[type="file"]') }
}

const image = (name = 'projeto.png', type = 'image/png', size = 10) => {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('PostForm', () => {
  it('requires a title and a description', async () => {
    const { onSubmit } = renderForm()

    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(screen.getByLabelText('Nome do projeto')).toHaveAccessibleDescription('Informe o nome do projeto.')
    expect(screen.getByLabelText('Descrição')).toHaveAccessibleDescription('Descreva o projeto.')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits what was filled, with tags and the chosen image', async () => {
    const { onSubmit, fileInput } = renderForm()
    const file = image()

    await userEvent.type(screen.getByLabelText('Nome do projeto'), '  React zero to hero ')
    await userEvent.type(screen.getByLabelText('Descrição'), 'Um projeto')
    await userEvent.type(screen.getByLabelText('Código'), 'let a = 1')
    await userEvent.type(screen.getByLabelText('Tags'), 'React{Enter}')
    await userEvent.upload(fileInput(), file)
    await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'React zero to hero',
      body: 'Um projeto',
      code: 'let a = 1',
      tags: ['React'],
      thumbnail: file,
    })
  })

  it('previews the chosen image and lets it be removed', async () => {
    const { container, fileInput } = renderForm()

    await userEvent.upload(fileInput(), image('capa.png'))

    expect(container.querySelector('img')).toHaveAttribute('src', 'blob:preview')
    expect(screen.getByText('capa.png')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Remover imagem capa.png' }))

    expect(container.querySelector('img')).not.toBeInTheDocument()
    expect(screen.getByTestId('thumbnail-placeholder')).toBeInTheDocument()
  })

  it.each([
    ['a wrong type', image('a.gif', 'image/gif')],
    ['a file over 2 MB', image('grande.png', 'image/png', 3 * 1024 * 1024)],
  ])('rejects %s', async (_, file) => {
    const { fileInput } = renderForm()

    // o seletor de arquivos do navegador pode ser contornado com "Todos os arquivos"
    await userEvent.setup({ applyAccept: false }).upload(fileInput(), file)

    expect(screen.getByRole('alert')).toHaveTextContent('JPG, PNG ou WebP de até 2 MB')
    expect(screen.queryByText(file.name)).not.toBeInTheDocument()
  })

  it('discards', async () => {
    const { onDiscard } = renderForm()

    await userEvent.click(screen.getByRole('button', { name: 'Descartar' }))

    expect(onDiscard).toHaveBeenCalledOnce()
  })

  it('shows the server error and blocks double submission', () => {
    renderForm({ error: 'Algo deu errado.', submitting: true })

    expect(screen.getByRole('alert')).toHaveTextContent('Algo deu errado.')
    expect(screen.getByRole('button', { name: 'Publicando…' })).toBeDisabled()
  })
})
