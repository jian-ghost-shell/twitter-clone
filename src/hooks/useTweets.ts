'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { api, Tweet } from '@/lib/api'

export type { Tweet }

interface UseTweetsOptions {
  endpoint?: string
  refreshTrigger?: number
}

interface UseTweetsReturn {
  tweets: Tweet[]
  loading: boolean
  hasMore: boolean
  fetchMore: () => void
  refresh: () => void
  handleLike: (tweetId: string) => Promise<void>
  handleRetweet: (tweetId: string) => Promise<void>
  handleReply: (tweetId: string) => Promise<void>
  handleBookmark: (tweetId: string) => Promise<void>
  handleDelete: (tweetId: string) => Promise<void>
  prependTweet: (tweet: Tweet) => void
}

export function useTweets({ endpoint = '/api/tweets', refreshTrigger = 0 }: UseTweetsOptions = {}): UseTweetsReturn {
  const { data: session } = useSession()
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const fetchTweets = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true)
    }
    try {
      let data: { tweets: Tweet[]; nextCursor: string | null } | Tweet[]
      if (endpoint === '/api/tweets') {
        data = await api.tweets.list()
      } else if (endpoint.startsWith('/api/users/') && endpoint.includes('/tweets')) {
        const userId = endpoint.split('/')[3]
        data = { tweets: await api.tweets.byUser(userId), nextCursor: null }
      } else {
        const res = await fetch(endpoint)
        data = await res.json()
      }

      if (Array.isArray(data)) {
        setTweets(data)
        setHasMore(false)
      } else {
        setTweets(data.tweets)
        setCursor(data.nextCursor)
        setHasMore(data.nextCursor !== null)
      }
    } catch (error) {
      console.error('Error fetching tweets:', error)
    }
    setLoading(false)
  }, [endpoint])

  const fetchMoreTweets = useCallback(async () => {
    if (loadingMore || !hasMore || !cursor) return
    setLoadingMore(true)
    try {
      if (endpoint === '/api/tweets') {
        const data = await api.tweets.list({ cursor })
        setTweets(prev => [...prev, ...data.tweets])
        setCursor(data.nextCursor)
        setHasMore(data.nextCursor !== null)
      }
    } catch (error) {
      console.error('Error fetching more tweets:', error)
    }
    setLoadingMore(false)
  }, [loadingMore, hasMore, cursor, endpoint])

  useEffect(() => {
    fetchTweets(true)
  }, [refreshTrigger, fetchTweets])

  // Prepend a new tweet (used for real-time updates)
  const prependTweet = useCallback((tweet: Tweet) => {
    setTweets(prev => [tweet, ...prev])
  }, [])

  // Optimistic like
  const handleLike = useCallback(async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to like')
      return
    }

    const tweet = tweets.find(t => t.id === tweetId)
    if (!tweet) return

    const isCurrentlyLiked = tweet.liked || false

    // Optimistic update
    setTweets(prev => prev.map(t => {
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
      await api.tweets.like(tweetId)
    } catch (error) {
      console.error('Error liking tweet:', error)
      // Rollback
      setTweets(prev => prev.map(t => {
        if (t.id === tweetId) {
          return { ...t, liked: isCurrentlyLiked }
        }
        return t
      }))
    }
  }, [session, tweets])

  // Optimistic retweet
  const handleRetweet = useCallback(async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to retweet')
      return
    }

    const tweet = tweets.find(t => t.id === tweetId)
    if (!tweet) return

    const isCurrentlyRetweeted = tweet.retweeted || false

    // Optimistic update
    setTweets(prev => prev.map(t => {
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
      await api.tweets.retweet(tweetId)
    } catch (error) {
      console.error('Error retweeting:', error)
      // Rollback
      setTweets(prev => prev.map(t => {
        if (t.id === tweetId) {
          return { ...t, retweeted: isCurrentlyRetweeted }
        }
        return t
      }))
    }
  }, [session, tweets])

  // Reply
  const handleReply = useCallback(async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to reply')
      return
    }

    const content = prompt('Write your reply:')
    if (!content?.trim()) return

    try {
      await api.tweets.reply(tweetId, content)
      fetchTweets(true)
    } catch (error) {
      console.error('Error creating reply:', error)
    }
  }, [session, fetchTweets])

  // Optimistic bookmark
  const handleBookmark = useCallback(async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to bookmark')
      return
    }

    const tweet = tweets.find(t => t.id === tweetId)
    if (!tweet) return

    const isCurrentlyBookmarked = tweet.bookmarked || false

    // Optimistic update
    setTweets(prev => prev.map(t => {
      if (t.id === tweetId) {
        return { ...t, bookmarked: !isCurrentlyBookmarked }
      }
      return t
    }))

    try {
      await api.tweets.bookmark(tweetId)
    } catch (error) {
      console.error('Error bookmarking tweet:', error)
      // Rollback
      setTweets(prev => prev.map(t => {
        if (t.id === tweetId) {
          return { ...t, bookmarked: isCurrentlyBookmarked }
        }
        return t
      }))
    }
  }, [session, tweets])

  // Delete
  const handleDelete = useCallback(async (tweetId: string) => {
    try {
      await api.tweets.delete(tweetId)
      setTweets(prev => prev.filter(t => t.id !== tweetId))
    } catch (error) {
      console.error('Error deleting tweet:', error)
    }
  }, [])

  const refresh = useCallback(() => {
    fetchTweets(true)
  }, [fetchTweets])

  return {
    tweets,
    loading,
    hasMore,
    fetchMore: fetchMoreTweets,
    refresh,
    handleLike,
    handleRetweet,
    handleReply,
    handleBookmark,
    handleDelete,
    prependTweet,
  }
}
