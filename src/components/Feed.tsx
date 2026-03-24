'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { TweetList } from './TweetList'
import { ErrorBoundary } from './ErrorBoundary'
import { useTweets, Tweet } from '@/hooks/useTweets'

interface FeedProps {
  refreshTrigger?: number
  endpoint?: string
}

export function Feed({ refreshTrigger, endpoint = '/api/tweets' }: FeedProps) {
  const { data: session } = useSession()
  const {
    tweets,
    loading,
    hasMore,
    fetchMore,
    handleLike,
    handleRetweet,
    handleReply,
    handleBookmark,
    handleDelete,
    prependTweet,
  } = useTweets({ endpoint, refreshTrigger })

  const observerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!observerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, loading, fetchMore])

  // Real-time: subscribe to global Pusher channel for new tweets
  useEffect(() => {
    const key = (process.env.NEXT_PUBLIC_PUSHER_KEY || '').trim()
    if (!key) return

    const Pusher = require('pusher-js')
    const pusher = new Pusher(key, {
      cluster: (process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '').trim(),
    })

    const channel = pusher.subscribe('public-global')

    channel.bind('tweet:created', (data: unknown) => {
      try {
        const event = data as { tweet?: Partial<Tweet> }
        if (!event?.tweet?.user?.id) return
        if (session?.user?.id && event.tweet.user.id === session.user.id) return
        const fullTweet: Tweet = {
          id: event.tweet.id || '',
          content: event.tweet.content || '',
          image: event.tweet.image || null,
          createdAt: event.tweet.createdAt || new Date().toISOString(),
          user: event.tweet.user,
          parent: event.tweet.parent,
          retweetOf: event.tweet.retweetOf,
          _count: event.tweet._count || { likes: 0, retweets: 0, replies: 0 },
          liked: false,
          retweeted: false,
          bookmarked: false,
        }
        prependTweet(fullTweet)
      } catch (e) {
        console.error('[Pusher] tweet:created error:', e)
      }
    })

    channel.bind('pusher:error', (err: unknown) => {
      console.error('[Pusher] connection error:', err)
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe('public-global')
    }
  }, [session?.user?.id, prependTweet])

  if (loading && tweets.length === 0) {
    return (
      <div className="feed-loading">
        <p>Loading tweets...</p>
      </div>
    )
  }

  if (tweets.length === 0) {
    return (
      <div className="feed-empty">
        <p>No tweets yet. Be the first to post!</p>
      </div>
    )
  }

  return (
    <div>
      <ErrorBoundary>
        <TweetList
          tweets={tweets}
          onLike={handleLike}
          onRetweet={handleRetweet}
          onReply={handleReply}
          onBookmark={handleBookmark}
          onDelete={handleDelete}
        />
      </ErrorBoundary>
      
      {/* Infinite scroll trigger */}
      <div ref={observerRef} className="feed-scroll-trigger">
        {loading && tweets.length > 0 && (
          <div className="feed-loading-more">Loading more...</div>
        )}
        {!hasMore && tweets.length > 0 && (
          <div className="feed-end">You're all caught up ✨</div>
        )}
      </div>
    </div>
  )
}
