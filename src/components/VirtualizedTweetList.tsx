'use client'
import { useRef, useEffect } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { TweetItem } from './TweetItem'

interface Tweet {
  id: string
  content: string
  image: string | null
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
  parent?: { id: string; content: string; user: { id: string; name: string | null; image: string | null } } | null
  retweetOf?: {
    id: string
    content: string
    image: string | null
    createdAt: string
    user: { id: string; name: string | null; image: string | null }
    _count: { likes: number; retweets: number; replies: number }
  } | null
  _count: { likes: number; retweets: number; replies: number }
  liked?: boolean
  retweeted?: boolean
  bookmarked?: boolean
}

interface Props {
  tweets: Tweet[]
  onLike: (id: string) => void
  onRetweet: (id: string) => void
  onReply: (id: string) => void
  onBookmark: (id: string) => void
  onDelete?: (id: string) => void
  onTriggerIntersect?: () => void
  isLoading?: boolean
  hasMore?: boolean
}

export function VirtualizedTweetList({ tweets, onLike, onRetweet, onReply, onBookmark, onDelete, onTriggerIntersect, isLoading, hasMore }: Props) {
  const parentRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: tweets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200,
    overscan: 5,
  })

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!triggerRef.current || !onTriggerIntersect) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onTriggerIntersect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(triggerRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoading, onTriggerIntersect])

  return (
    <div
      ref={parentRef}
      className="feed"
      style={{ height: '100%', overflow: 'auto' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => {
          const tweet = tweets[virtualRow.index]
          return (
            <div
              key={tweet.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
              data-index={virtualRow.index}
            >
              <TweetItem
                tweet={tweet}
                onLike={onLike}
                onRetweet={onRetweet}
                onReply={onReply}
                onBookmark={onBookmark}
                onDelete={onDelete}
              />
            </div>
          )
        })}
      </div>
      
      {/* Infinite scroll trigger */}
      <div ref={triggerRef} className="feed-scroll-trigger">
        {isLoading && tweets.length > 0 && (
          <div className="feed-loading-more">
            <span className="loading-spinner" />
          </div>
        )}
        {!hasMore && tweets.length > 0 && (
          <div className="feed-end">You're all caught up ✨</div>
        )}
      </div>
    </div>
  )
}
