import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import Alert from '../components/atoms/Alert'
import Tab from '../components/atoms/Tab'
import FeedFilters from '../components/organisms/FeedFilters'
import PostList from '../components/organisms/PostList'
import AppTemplate from '../components/templates/AppTemplate'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/errors'
import { likePost, listPosts, listTags, unlikePost } from '../services/posts'

const PAGE_SIZE = 6
const TABS = [
  { sort: 'recent', label: 'Recentes' },
  { sort: 'popular', label: 'Populares' },
]

export default function FeedPage() {
  const { status: authStatus } = useAuth()
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const tagsParam = params.get('tags') ?? ''
  const tags = tagsParam.split(',').filter(Boolean)
  const sort = params.get('sort') === 'popular' ? 'popular' : 'recent'

  // O resultado guarda a chave da consulta que o gerou: enquanto ela não bate com
  // a URL atual, o feed está "carregando" (sem precisar de setState no efeito).
  const requestKey = [q, tagsParam, sort].join('\n')
  const [feed, setFeed] = useState({ key: null, posts: [], total: 0, page: 1, error: '' })
  const status = feed.key !== requestKey ? 'loading' : feed.error ? 'error' : 'ready'
  const [actionError, setActionError] = useState('')
  const [loadingMore, setLoadingMore] = useState(false)
  const [suggestions, setSuggestions] = useState([])

  const canInteract = authStatus === 'authenticated'

  useEffect(() => {
    listTags(8)
      .then((popular) => setSuggestions(popular.map((tag) => tag.name)))
      .catch(() => {}) // as sugestões são opcionais
  }, [])

  // Recarrega do início quando os filtros mudam ou a sessão é restaurada, para a
  // primeira resposta já trazer `likedByMe`.
  useEffect(() => {
    if (authStatus === 'loading') return
    let cancelled = false
    listPosts({ q, tags: tagsParam ? tagsParam.split(',') : [], sort, page: 1, limit: PAGE_SIZE })
      .then(({ data, meta }) => {
        if (!cancelled) setFeed({ key: requestKey, posts: data, total: meta.total, page: 1, error: '' })
      })
      .catch((err) => {
        if (!cancelled) setFeed({ key: requestKey, posts: [], total: 0, page: 1, error: getErrorMessage(err) })
      })
    return () => {
      cancelled = true
    }
  }, [q, tagsParam, sort, requestKey, authStatus])

  function updateParams(changes) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setActionError('')
    setParams(next)
  }

  function handleToggleTag(name) {
    const selected = tags.some((tag) => tag.toLowerCase() === name.toLowerCase())
    const next = selected ? tags.filter((tag) => tag.toLowerCase() !== name.toLowerCase()) : [...tags, name]
    updateParams({ tags: next.join(',') })
  }

  async function handleLoadMore() {
    setLoadingMore(true)
    setActionError('')
    try {
      const next = feed.page + 1
      const { data, meta } = await listPosts({ q, tags, sort, page: next, limit: PAGE_SIZE })
      setFeed((current) =>
        current.key === requestKey
          ? { ...current, posts: [...current.posts, ...data], total: meta.total, page: next }
          : current,
      )
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setLoadingMore(false)
    }
  }

  async function handleLike(post) {
    const liked = !post.likedByMe
    // Otimista: atualiza já e desfaz se a API recusar
    const apply = (value) =>
      setFeed((current) => ({
        ...current,
        posts: current.posts.map((item) =>
          item.id === post.id ? { ...item, likedByMe: value, likesCount: item.likesCount + (value ? 1 : -1) } : item,
        ),
      }))
    apply(liked)
    setActionError('')
    try {
      await (liked ? likePost : unlikePost)(post.id)
    } catch (err) {
      apply(!liked)
      setActionError(getErrorMessage(err))
    }
  }

  return (
    <>
      <title>Feed · Code Connect</title>
      <AppTemplate>
        <div className="flex flex-col gap-14">
          <h1 className="sr-only">Feed</h1>
          <FeedFilters
            q={q}
            tags={tags}
            suggestions={suggestions}
            onSearch={(text) => updateParams({ q: text })}
            onToggleTag={handleToggleTag}
            onClear={() => updateParams({ q: '', tags: '' })}
          />
          <div className="flex flex-col gap-8">
            <div role="tablist" aria-label="Ordenar posts" className="flex justify-center gap-6">
              {TABS.map((tab) => (
                <Tab
                  key={tab.sort}
                  id={`tab-${tab.sort}`}
                  aria-controls="feed-posts"
                  active={sort === tab.sort}
                  onClick={() => updateParams({ sort: tab.sort === 'recent' ? '' : tab.sort })}
                >
                  {tab.label}
                </Tab>
              ))}
            </div>
            <Alert className="text-center text-lg">{actionError}</Alert>
            <div id="feed-posts" role="tabpanel" aria-labelledby={`tab-${sort}`}>
              <PostList
                posts={status === 'ready' ? feed.posts : []}
                status={status}
                error={feed.error}
                hasMore={feed.posts.length < feed.total}
                loadingMore={loadingMore}
                onLoadMore={handleLoadMore}
                canInteract={canInteract}
                onLike={handleLike}
              />
            </div>
          </div>
        </div>
      </AppTemplate>
    </>
  )
}
