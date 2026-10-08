import { Link } from 'react-router'
import Tag from '../atoms/Tag'
import AuthorBadge from '../molecules/AuthorBadge'
import PostActions from '../molecules/PostActions'
import PostThumbnail from '../molecules/PostThumbnail'

/**
 * Card do feed. O link do título cobre o card inteiro (`after:absolute`), então
 * as ações ficam acima dele (`z-10`) para continuarem clicáveis.
 */
export default function PostCard({ post, canInteract, onLike }) {
  const href = `/posts/${post.id}`

  return (
    <article className="relative flex h-full flex-col rounded-lg">
      <PostThumbnail src={post.thumbnailUrl} />
      <div className="flex flex-1 flex-col gap-4 rounded-b-lg bg-surface p-4">
        <div className="flex flex-col gap-2 text-light">
          <h2 className="text-lg font-semibold">
            <Link
              to={href}
              className="rounded after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-brand"
            >
              {post.title}
            </Link>
          </h2>
          <p className="line-clamp-3 text-[15px]">{post.excerpt}</p>
        </div>
        {post.tags.length > 0 && (
          <ul aria-label="Tags" className="flex flex-wrap gap-2.5">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Tag>{tag}</Tag>
              </li>
            ))}
          </ul>
        )}
        <div className="relative z-10 mt-auto flex items-center justify-between">
          <PostActions
            likesCount={post.likesCount}
            commentsCount={post.commentsCount}
            liked={post.likedByMe}
            canInteract={canInteract}
            onLike={() => onLike(post)}
            shareUrl={`${window.location.origin}${href}`}
            commentsHref={`${href}#comentarios`}
          />
          <AuthorBadge name={post.author.name} />
        </div>
      </div>
    </article>
  )
}
