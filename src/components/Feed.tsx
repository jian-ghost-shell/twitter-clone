'use client'

import { useState, useEffect } from 'react'
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

  const fetchTweets = async () => {
    setLoading(true)
    try {
      const res = await fetch(endpoint)
      const data = await res.json()
      setTweets(data)
    } catch (error) {
      console.error('Error fetching tweets:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTweets()
  }, [refreshTrigger, endpoint])

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
        fetchTweets()
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
    <TweetList 
      tweets={tweets}
      onLike={handleLike}
      onRetweet={handleRetweet}
      onReply={handleReply}
      onBookmark={handleBookmark}
    />
  )
}
