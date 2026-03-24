'use client'

import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { TweetList } from '@/components/TweetList'
import { SkeletonFeed } from '@/components/SkeletonFeed'
import { useProfile } from '@/hooks/useProfile'

export default function ProfilePage() {
  const params = useParams()
  const { data: session } = useSession()
  
  const userId = params.id as string
  const isOwnProfile = session?.user?.id === userId

  const {
    user,
    tweets,
    loading,
    follow,
    isFollowing,
    handleLike,
    handleRetweet,
    handleReply,
    handleBookmark,
    handleDelete,
  } = useProfile({ userId })

  if (loading) {
    return (
      <div className="profile-container">
        <header className="profile-header">
          <Link href="/" className="back-btn">←</Link>
          <div className="profile-title">
            <h1>Profile</h1>
          </div>
        </header>
        <SkeletonFeed />
      </div>
    )
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
              className={`follow-btn ${isFollowing ? 'following' : ''}`}
              onClick={follow}
            >
              {isFollowing ? 'Following' : 'Follow'}
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
