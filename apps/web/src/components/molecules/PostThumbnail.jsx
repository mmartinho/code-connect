import { useState } from 'react'

const frames = {
  card: 'h-[240px] p-6',
  detail: 'h-[320px] px-4 py-6',
}

// Barras de largura variada, usadas quando o post também não tem código
const FAKE_LINES = ['w-2/5', 'w-3/5', 'w-1/2', 'w-4/5', 'w-1/3', 'w-2/3', 'w-1/4']

function PlaceholderPanel({ code }) {
  const lines = code?.trim() ? code.split('\n').slice(0, 9) : null

  return (
    <div data-testid="thumbnail-placeholder" className="flex size-full flex-col bg-surface">
      <div className="flex gap-1.5 px-4 py-3" aria-hidden="true">
        <span className="size-2.5 rounded-full bg-error" />
        <span className="size-2.5 rounded-full bg-brand" />
        <span className="size-2.5 rounded-full bg-muted" />
      </div>
      {lines ? (
        <pre className="flex-1 overflow-hidden px-4 pb-4 font-mono text-[13px] leading-relaxed text-light">{lines.join('\n')}</pre>
      ) : (
        <div className="flex flex-1 flex-col gap-3 px-4 pb-4" aria-hidden="true">
          {FAKE_LINES.map((width) => (
            <span key={width} className={`h-2 rounded-full bg-muted/40 ${width}`} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Capa do post dentro do quadro cinza do Figma. Sem imagem (ou se ela falhar ao
 * carregar) mostra um painel que imita um editor de código, com o mesmo tamanho
 * da imagem para o layout não pular.
 */
export default function PostThumbnail({ src, code, variant = 'card' }) {
  const [failedSrc, setFailedSrc] = useState(null)
  const showImage = Boolean(src) && failedSrc !== src

  return (
    <div className={`bg-muted ${frames[variant]} rounded-t-lg`}>
      <div className="size-full overflow-hidden rounded-lg shadow-[0_16px_24px_rgba(0,0,0,0.24)]">
        {showImage ? (
          <img src={src} alt="" onError={() => setFailedSrc(src)} className="size-full object-cover" />
        ) : (
          <PlaceholderPanel code={code} />
        )}
      </div>
    </div>
  )
}
