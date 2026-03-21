'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface Tweet {
  id: string
  content: string
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
}

interface FeedProps {
  refreshTrigger?: number
}

export function Feed({ refreshTrigger }: FeedProps) {
  const { data: session } = useSession()
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTweets = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tweets')
      const data = await res.json()
      setTweets(data)
    } catch (error) {
      console.error('Error fetching tweets:', error)
    }
    setLoading(false)
  }

  // Fetch tweets when refreshTrigger changes
  useEffect(() => {
    fetchTweets()
  }, [refreshTrigger])

  // Fetch user's likes and retweets
  useEffect(() => {
    if (session?.user?.id) {
      // For now, just fetch tweets and check if user liked/retweeted
      // In production, you'd have a separate endpoint to get user's likes/retweets
      fetchTweets()
    }
  }, [session])

  const handleLike = async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to like')
      return
    }

    const tweet = tweets.find(t => t.id === tweetId)
    if (!tweet) return

    // Optimistic update
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
      await fetch(`/api/tweets/${tweetId}/like`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error liking tweet:', error)
      // Revert on error
      setTweets(tweets.map(t => {
        if (t.id === tweetId) {
          return {
            ...t,
            liked: isCurrentlyLiked,
            _count: {
              ...t._count,
              likes: isCurrentlyLiked ? t._count.likes : t._count.likes - 1
            }
          }
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
        // Refresh tweets to show new reply count
        fetchTweets()
      }
    } catch (error) {
      console.error('Error creating reply:', error)
    }
  }

  const handleRetweet = async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to retweet')
      return
    }

    const tweet = tweets.find(t => t.id === tweetId)
    if (!tweet) return

    // Optimistic update
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
      await fetch(`/api/tweets/${tweetId}/retweet`, {
        method: 'POST'
      })
    } catch (error) {
      console.error('Error retweeting:', error)
      // Revert on error
      setTweets(tweets.map(t => {
        if (t.id === tweetId) {
          return {
            ...t,
            retweeted: isCurrentlyRetweeted,
            _count: {
              ...t._count,
              retweets: isCurrentlyRetweeted ? t._count.retweets : t._count.retweets - 1
            }
          }
        }
        return t
      }))
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
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
    <div className="feed">
      {tweets.map((tweet) => (
        <div key={tweet.id} className="tweet">
          <div className="tweet-avatar">
            {tweet.user.image ? (
              <img src={tweet.user.image} alt={tweet.user.name || 'User'} />
            ) : (
              <div className="tweet-avatar-placeholder">
                {tweet.user.name?.[0] || '?'}
              </div>
            )}
          </div>
          <div className="tweet-content">
            <div className="tweet-header">
              <Link href={`/profile/${tweet.user.id}`} className="tweet-name">
                {tweet.user.name || 'Anonymous'}
              </Link>
              <span className="tweet-time">{formatDate(tweet.createdAt)}</span>
            </div>
            <div className="tweet-text">{tweet.content}</div>
            <div className="tweet-actions">
              <button 
                className="action-btn"
                onClick={() => handleReply(tweet.id)}
              >
                <span className="action-icon">💬</span>
                <span className="action-count">{tweet._count.replies}</span>
              </button>
              <button 
                className={`action-btn ${tweet.retweeted ? 'retweeted' : ''}`}
                onClick={() => handleRetweet(tweet.id)}
              >
                <span className="action-icon">🔁</span>
                <span className="action-count">{tweet._count.retweets}</span>
              </button>
              <button 
                className={`action-btn ${tweet.liked ? 'liked' : ''}`}
                onClick={() => handleLike(tweet.id)}
              >
                <span className="action-icon">❤️</span>
                <span className="action-count">{tweet._count.likes}</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
