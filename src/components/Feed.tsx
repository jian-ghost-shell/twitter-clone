'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { TweetList } from './TweetList'

interface Tweet {
  id: string
  content: string
  image: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  _count: {
    likes: number
    retweets: number
    replies: number
  }
  liked?: boolean
  retweeted?: boolean
  bookmarked?: boolean
}

interface FeedProps {
  refreshTrigger?: number
  endpoint?: string
}

export function Feed({ refreshTrigger, endpoint = '/api/tweets' }: FeedProps) {
  const { data: session } = useSession()
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef<HTMLDivElement>(null)

  const fetchTweets = async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true)
    }
    try {
      const url = endpoint
      const res = await fetch(url)
      const data = await res.json()
      
      if (Array.isArray(data)) {
        // Legacy format (no pagination)
        setTweets(data)
        setHasMore(false)
      } else {
        // New paginated format
        setTweets(data.tweets)
        setCursor(data.nextCursor)
        setHasMore(data.nextCursor !== null)
      }
    } catch (error) {
      console.error('Error fetching tweets:', error)
    }
    setLoading(false)
  }

  const fetchMoreTweets = async () => {
    if (loadingMore || !hasMore || !cursor) return
    setLoadingMore(true)
    try {
      const url = `${endpoint}?cursor=${encodeURIComponent(cursor)}`
      const res = await fetch(url)
      const data = await res.json()
      
      if (Array.isArray(data)) return
      
      setTweets(prev => [...prev, ...data.tweets])
      setCursor(data.nextCursor)
      setHasMore(data.nextCursor !== null)
    } catch (error) {
      console.error('Error fetching more tweets:', error)
    }
    setLoadingMore(false)
  }

  useEffect(() => {
    fetchTweets(true)
  }, [refreshTrigger])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!observerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchMoreTweets()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, loading, cursor])

  const handleLike = async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to like')
      return
    }

    const tweet = tweets.find(t => t.id === tweetId)
    if (!tweet) return

    const isCurrentlyLiked = tweet.liked || false
    setTweets(tweets.map(t => {
      if (t.id === tweetId) {
        return {
          ...t,
          liked: !isCurrentlyLiked,
          _count: {
            ...t._count,
            likes: isCurrentlyLiked ? t._count.likes - 1 : t._count.likes + 1
          }
        }
      }
      return t
    }))

    try {
      await fetch(`/api/tweets/${tweetId}/like`, { method: 'POST' })
    } catch (error) {
      console.error('Error liking tweet:', error)
      setTweets(tweets.map(t => {
        if (t.id === tweetId) {
          return { ...t, liked: isCurrentlyLiked }
        }
        return t
      }))
    }
  }

  const handleRetweet = async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to retweet')
      return
    }

    const tweet = tweets.find(t => t.id === tweetId)
    if (!tweet) return

    const isCurrentlyRetweeted = tweet.retweeted || false
    setTweets(tweets.map(t => {
      if (t.id === tweetId) {
        return {
          ...t,
          retweeted: !isCurrentlyRetweeted,
          _count: {
            ...t._count,
            retweets: isCurrentlyRetweeted ? t._count.retweets - 1 : t._count.retweets + 1
          }
        }
      }
      return t
    }))

    try {
      await fetch(`/api/tweets/${tweetId}/retweet`, { method: 'POST' })
    } catch (error) {
      console.error('Error retweeting:', error)
      setTweets(tweets.map(t => {
        if (t.id === tweetId) {
          return { ...t, retweeted: isCurrentlyRetweeted }
        }
        return t
      }))
    }
  }

  const handleReply = async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to reply')
      return
    }

    const content = prompt('Write your reply:')
    if (!content?.trim()) return

    try {
      const res = await fetch(`/api/tweets/${tweetId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })

      if (res.ok) {
        fetchTweets(true)
      }
    } catch (error) {
      console.error('Error creating reply:', error)
    }
  }

  const handleBookmark = async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to bookmark')
      return
    }

    const tweet = tweets.find(t => t.id === tweetId)
    if (!tweet) return

    const isCurrentlyBookmarked = tweet.bookmarked || false
    setTweets(tweets.map(t => {
      if (t.id === tweetId) {
        return { ...t, bookmarked: !isCurrentlyBookmarked }
      }
      return t
    }))

    try {
      await fetch(`/api/tweets/${tweetId}/bookmark`, { method: 'POST' })
    } catch (error) {
      console.error('Error bookmarking tweet:', error)
      setTweets(tweets.map(t => {
        if (t.id === tweetId) {
          return { ...t, bookmarked: isCurrentlyBookmarked }
        }
        return t
      }))
    }
  }

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
      <TweetList
        tweets={tweets}
        onLike={handleLike}
        onRetweet={handleRetweet}
        onReply={handleReply}
        onBookmark={handleBookmark}
      />
      
      {/* Infinite scroll trigger */}
      <div ref={observerRef} className="feed-scroll-trigger">
        {loadingMore && (
          <div className="feed-loading-more">Loading more...</div>
        )}
        {!hasMore && tweets.length > 0 && (
          <div className="feed-end">You're all caught up ✨</div>
        )}
      </div>
    </div>
  )
}
