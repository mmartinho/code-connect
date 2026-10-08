import { fireEvent, render, screen } from '@testing-library/react'
import PostThumbnail from './PostThumbnail'

describe('PostThumbnail', () => {
  it('shows the image when the post has one', () => {
    const { container } = render(<PostThumbnail src="http://x/a.png" />)

    expect(container.querySelector('img')).toHaveAttribute('src', 'http://x/a.png')
    expect(screen.queryByTestId('thumbnail-placeholder')).not.toBeInTheDocument()
  })

  it('shows the placeholder when there is no image', () => {
    const { container } = render(<PostThumbnail src={null} />)

    expect(screen.getByTestId('thumbnail-placeholder')).toBeInTheDocument()
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('falls back to the placeholder when the image fails to load', () => {
    const { container } = render(<PostThumbnail src="http://x/broken.png" />)

    fireEvent.error(container.querySelector('img'))

    expect(screen.getByTestId('thumbnail-placeholder')).toBeInTheDocument()
  })

  it('tries again when the source changes after a failure', () => {
    const { container, rerender } = render(<PostThumbnail src="http://x/broken.png" />)
    fireEvent.error(container.querySelector('img'))

    rerender(<PostThumbnail src="http://x/ok.png" />)

    expect(container.querySelector('img')).toHaveAttribute('src', 'http://x/ok.png')
  })

  it('previews the first lines of the post code inside the placeholder', () => {
    render(<PostThumbnail src={null} code={'const a = 1\nconst b = 2'} />)

    expect(screen.getByTestId('thumbnail-placeholder')).toHaveTextContent('const a = 1 const b = 2')
  })

  it('shows decorative lines instead of an empty editor when the code is blank', () => {
    render(<PostThumbnail src={null} code={'  \n'} />)

    expect(screen.getByTestId('thumbnail-placeholder').querySelector('pre')).not.toBeInTheDocument()
  })

  it('keeps the frame height of each variant', () => {
    const { container, rerender } = render(<PostThumbnail src={null} />)
    expect(container.firstChild).toHaveClass('h-[240px]')

    rerender(<PostThumbnail src={null} variant="detail" />)
    expect(container.firstChild).toHaveClass('h-[320px]')
  })
})
