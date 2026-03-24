'use client'

import { useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { TweetList } from './TweetList'
import { ErrorBoundary } from './ErrorBoundary'
import { SkeletonFeed } from './SkeletonFeed'
import { useTweets, Tweet } from '@/hooks/useTweets'
import { getPusherClient } from '@/hooks/useRealtime'

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

  const handleTriggerIntersect = useCallback(() => {
    if (hasMore && !loading) {
      fetchMore()
    }
  }, [hasMore, loading, fetchMore])

  // Real-time: subscribe to global Pusher channel for new tweets
  useEffect(() => {
    const key = (process.env.NEXT_PUBLIC_PUSHER_KEY || '').trim()
    if (!key) return

    const pusher = getPusherClient()

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
    return <SkeletonFeed />
  }

  if (tweets.length === 0) {
    return (
      <div className="feed-empty">
        <p>No tweets yet. Be the first to post!</p>
      </div>
    )
  }

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
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
    </div>
  )
}
