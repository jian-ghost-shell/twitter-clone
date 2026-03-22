'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { TweetItem } from '@/components/TweetItem'
import { TweetForm } from '@/components/TweetForm'

interface Tweet {
  id: string
  content: string
  image: string | null
  createdAt: string
  parent: {
    id: string
    content: string
    user: {
      id: string
      name: string | null
      image: string | null
    }
  } | null
  user: {
    id: string
    name: string | null
    image: string | null
  }
  replies?: any[]
  _count: {
    likes: number
    retweets: number
    replies: number
  }
  liked?: boolean
  retweeted?: boolean
}

export default function TweetPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [tweet, setTweet] = useState<Tweet | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const tweetId = params.id as string

  useEffect(() => {
    const fetchTweet = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/tweets/${tweetId}`)
        if (res.ok) {
          setTweet(await res.json())
        }
      } catch (error) {
        console.error('Error fetching tweet:', error)
      }
      setLoading(false)
    }

    if (tweetId) {
      fetchTweet()
    }
  }, [tweetId, refreshTrigger])

  const handleReplyCreated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleLike = async () => {
    if (!session?.user) {
      alert('Please sign in to like')
      return
    }
    
    if (!tweet) return
    
    const isLiked = tweet.liked || false
    setTweet({
      ...tweet,
      liked: !isLiked,
      _count: {
        ...tweet._count,
        likes: isLiked ? tweet._count.likes - 1 : tweet._count.likes + 1
      }
    })

    try {
      await fetch(`/api/tweets/${tweetId}/like`, { method: 'POST' })
    } catch (error) {
      console.error('Error liking tweet:', error)
    }
  }

  const handleRetweet = async () => {
    if (!session?.user) {
      alert('Please sign in to retweet')
      return
    }
    
    if (!tweet) return
    
    const isRetweeted = tweet.retweeted || false
    setTweet({
      ...tweet,
      retweeted: !isRetweeted,
      _count: {
        ...tweet._count,
        retweets: isRetweeted ? tweet._count.retweets - 1 : tweet._count.retweets + 1
      }
    })

    try {
      await fetch(`/api/tweets/${tweetId}/retweet`, { method: 'POST' })
    } catch (error) {
      console.error('Error retweeting:', error)
    }
  }

  const handleReply = async () => {
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
        setRefreshTrigger(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error creating reply:', error)
    }
  }

  const handleBookmark = async () => {
    if (!session?.user) {
      alert('Please sign in to bookmark')
      return
    }
  }

  if (loading) {
    return <div className="tweet-detail-loading">Loading...</div>
  }

  if (!tweet) {
    return <div className="tweet-detail-error">Tweet not found</div>
  }

  return (
    <div className="tweet-detail-container">
      <header className="tweet-detail-header">
        <button onClick={() => router.back()} className="back-btn">←</button>
        <h1>Tweet</h1>
      </header>

      {/* Parent tweet (if this is a reply) */}
      {tweet.parent && (
        <div className="parent-tweet">
          <span className="reply-indicator">Replying to</span>
          <Link href={`/tweet/${tweet.parent.id}`} className="parent-tweet-link">
            <div className="parent-tweet-content">
              <span className="parent-user">{tweet.parent.user.name}</span>
              <span className="parent-content">{tweet.parent.content}</span>
            </div>
          </Link>
        </div>
      )}

      {/* Main tweet */}
      <div className="main-tweet">
        <div className="tweet-avatar">
          {tweet.user.image ? (
            <img src={tweet.user.image} alt={tweet.user.name || ''} />
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
            <span className="tweet-time">
              {new Date(tweet.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="tweet-text">{tweet.content}</div>
          {tweet.image && (
            <div className="tweet-image">
              <img src={tweet.image} alt="Tweet" />
            </div>
          )}
          <div className="tweet-actions">
            <button className="action-btn" onClick={handleReply}>
              <span className="action-icon">💬</span>
              <span className="action-count">{tweet._count.replies}</span>
            </button>
            <button 
              className={`action-btn ${tweet.retweeted ? 'retweeted' : ''}`}
              onClick={handleRetweet}
            >
              <span className="action-icon">🔁</span>
              <span className="action-count">{tweet._count.retweets}</span>
            </button>
            <button 
              className={`action-btn ${tweet.liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              <span className="action-icon">❤️</span>
              <span className="action-count">{tweet._count.likes}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reply form */}
      {session && (
        <div className="reply-form">
          <TweetForm 
            currentUser={session.user}
            onTweetCreated={handleReplyCreated}
            replyToId={tweetId}
          />
        </div>
      )}

      {/* Replies */}
      <div className="replies-section">
        <h2>Replies</h2>
        {tweet.replies?.map((reply: any) => (
          <Link key={reply.id} href={`/tweet/${reply.id}`} className="reply-link">
            <div className="tweet">
              <div className="tweet-avatar">
                {reply.user.image ? (
                  <img src={reply.user.image} alt={reply.user.name || ''} />
                ) : (
                  <div className="tweet-avatar-placeholder">
                    {reply.user.name?.[0] || '?'}
                  </div>
                )}
              </div>
              <div className="tweet-content">
                <div className="tweet-header">
                  <span className="tweet-name">{reply.user.name || 'Anonymous'}</span>
                  <span className="tweet-time">
                    {new Date(reply.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="tweet-text">{reply.content}</div>
              </div>
            </div>
          </Link>
        ))}
        {(!tweet.replies || tweet.replies.length === 0) && (
          <p className="no-replies">No replies yet</p>
        )}
      </div>
    </div>
  )
}
