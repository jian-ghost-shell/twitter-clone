'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

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

export default function ProfilePage() {
  const params = useParams()
  const { data: session, update: updateSession } = useSession()
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
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
          tweets.map((tweet) => (
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
                  <span className="tweet-name">{tweet.user.name || 'Anonymous'}</span>
                  <span className="tweet-time">
                    {new Date(tweet.createdAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="tweet-text">{tweet.content}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
