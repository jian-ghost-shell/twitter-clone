'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { TweetList } from '@/components/TweetList'

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: string
  followersCount: number
  followingCount: number
  tweetsCount: number
  isFollowing: boolean
}

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
  parent?: {
    id: string
    content: string
    user: {
      id: string
      name: string | null
      image: string | null
    }
  } | null
  retweetOf?: {
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
  } | null
  _count: {
    likes: number
    retweets: number
    replies: number
  }
  liked?: boolean
  retweeted?: boolean
  bookmarked?: boolean
}

export default function ProfilePage() {
  const params = useParams()
  const { data: session } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)

  const userId = params.id as string
  const isOwnProfile = session?.user?.id === userId

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [userRes, tweetsRes] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/users/${userId}/tweets`)
        ])

        if (userRes.ok) {
          setUser(await userRes.json())
        }
        if (tweetsRes.ok) {
          setTweets(await tweetsRes.json())
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
      setLoading(false)
    }

    if (userId) {
      fetchData()
    }
  }, [userId])

  const handleFollow = async () => {
    if (!session?.user) {
      alert('Please sign in to follow')
      return
    }

    const method = user?.isFollowing ? 'DELETE' : 'POST'
    const res = await fetch(`/api/users/${userId}/follow`, { method })

    if (res.ok) {
      const data = await res.json()
      setUser(prev => prev ? {
        ...prev,
        isFollowing: data.following,
        followersCount: data.following ? prev.followersCount + 1 : prev.followersCount - 1
      } : null)
    }
  }

  const handleLike = async (tweetId: string) => {
    if (!session?.user) return
    const tweet = tweets.find(t => t.id === tweetId)
    if (!tweet) return
    const isCurrentlyLiked = tweet.liked || false
    setTweets(tweets.map(t => {
      if (t.id === tweetId) {
        return { ...t, liked: !isCurrentlyLiked, _count: { ...t._count, likes: isCurrentlyLiked ? t._count.likes - 1 : t._count.likes + 1 } }
      }
      return t
    }))
    try {
      await fetch(`/api/tweets/${tweetId}/like`, { method: 'POST' })
    } catch {
      setTweets(tweets.map(t => t.id === tweetId ? { ...t, liked: isCurrentlyLiked } : t))
    }
  }

  const handleRetweet = async (tweetId: string) => {
    if (!session?.user) return
    const tweet = tweets.find(t => t.id === tweetId)
    if (!tweet) return
    const isCurrentlyRetweeted = tweet.retweeted || false
    setTweets(tweets.map(t => {
      if (t.id === tweetId) {
        return { ...t, retweeted: !isCurrentlyRetweeted, _count: { ...t._count, retweets: isCurrentlyRetweeted ? t._count.retweets - 1 : t._count.retweets + 1 } }
      }
      return t
    }))
    try {
      await fetch(`/api/tweets/${tweetId}/retweet`, { method: 'POST' })
    } catch {
      setTweets(tweets.map(t => t.id === tweetId ? { ...t, retweeted: isCurrentlyRetweeted } : t))
    }
  }

  const handleReply = async (tweetId: string) => {
    if (!session?.user) return
    const content = prompt('Write your reply:')
    if (!content?.trim()) return
    try {
      const res = await fetch(`/api/tweets/${tweetId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      if (res.ok) {
        const [userRes, tweetsRes] = await Promise.all([
          fetch(`/api/users/${userId}`),
          fetch(`/api/users/${userId}/tweets`)
        ])
        if (tweetsRes.ok) setTweets(await tweetsRes.json())
      }
    } catch (error) {
      console.error('Error creating reply:', error)
    }
  }

  const handleBookmark = async (tweetId: string) => {
    if (!session?.user) return
    const tweet = tweets.find(t => t.id === tweetId)
    if (!tweet) return
    const isCurrentlyBookmarked = tweet.bookmarked || false
    setTweets(tweets.map(t => {
      if (t.id === tweetId) return { ...t, bookmarked: !isCurrentlyBookmarked }
      return t
    }))
    try {
      await fetch(`/api/tweets/${tweetId}/bookmark`, { method: 'POST' })
    } catch {
      setTweets(tweets.map(t => t.id === tweetId ? { ...t, bookmarked: isCurrentlyBookmarked } : t))
    }
  }

  const handleDelete = async (tweetId: string) => {
    try {
      const res = await fetch(`/api/tweets/${tweetId}`, { method: 'DELETE' })
      if (res.ok) {
        setTweets(tweets.filter(t => t.id !== tweetId))
      }
    } catch (error) {
      console.error('Error deleting tweet:', error)
    }
  }

  if (loading) {
    return <div className="profile-loading">Loading...</div>
  }

  if (!user) {
    return <div className="profile-error">User not found</div>
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <Link href="/" className="back-btn">←</Link>
        <div className="profile-title">
          <h1>{user.name || 'Anonymous'}</h1>
          <p>@{user.email?.split('@')[0]}</p>
        </div>
      </header>

      <div className="profile-info">
        <div className="profile-avatar">
          {user.image ? (
            <img src={user.image} alt={user.name || 'User'} />
          ) : (
            <div className="profile-avatar-placeholder">
              {user.name?.[0] || '?'}
            </div>
          )}
        </div>
        <div className="profile-actions">
          {session && !isOwnProfile && (
            <button
              className={`follow-btn ${user.isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {user.isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat">
          <span className="stat-value">{user.tweetsCount}</span>
          <span className="stat-label">Tweets</span>
        </div>
        <div className="stat">
          <span className="stat-value">{user.followingCount}</span>
          <span className="stat-label">Following</span>
        </div>
        <div className="stat">
          <span className="stat-value">{user.followersCount}</span>
          <span className="stat-label">Followers</span>
        </div>
      </div>

      <div className="profile-tweets">
        <h2>Tweets</h2>
        {tweets.length === 0 ? (
          <p className="no-tweets">No tweets yet</p>
        ) : (
          <TweetList
            tweets={tweets}
            onLike={handleLike}
            onRetweet={handleRetweet}
            onReply={handleReply}
            onBookmark={handleBookmark}
            onDelete={isOwnProfile ? handleDelete : undefined}
          />
        )}
      </div>
    </div>
  )
}
