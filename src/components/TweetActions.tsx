'use client'

import Link from 'next/link'

interface TweetActionsProps {
  tweet: {
    id: string
    user: {
      id: string
    }
    liked?: boolean
    retweeted?: boolean
    bookmarked?: boolean
    _count: {
      likes: number
      retweets: number
      replies: number
    }
  }
  currentUserId?: string
  onLike: (id: string) => void
  onRetweet: (id: string) => void
  onReply: (id: string) => void
  onBookmark: (id: string) => void
  onDelete?: (id: string) => void
}

export function TweetActions({
  tweet,
  currentUserId,
  onLike,
  onRetweet,
  onReply,
  onBookmark,
  onDelete
}: TweetActionsProps) {
  const isOwner = currentUserId === tweet.user.id

  return (
    <div className="tweet-actions">
      <Link href={`/tweet/${tweet.id}`} className="action-btn">
        <span className="action-icon">💬</span>
        <span className="action-count">{tweet._count.replies}</span>
      </Link>
      <button
        className={`action-btn ${tweet.retweeted ? 'retweeted' : ''}`}
        onClick={() => onRetweet(tweet.id)}
      >
        <span className="action-icon">🔁</span>
        <span className="action-count">{tweet._count.retweets}</span>
      </button>
      <button
        className={`action-btn ${tweet.liked ? 'liked' : ''}`}
        onClick={() => onLike(tweet.id)}
      >
        <span className="action-icon">❤️</span>
        <span className="action-count">{tweet._count.likes}</span>
      </button>
      <button
        className={`action-btn ${tweet.bookmarked ? 'bookmarked' : ''}`}
        onClick={() => onBookmark(tweet.id)}
      >
        <span className="action-icon">🔖</span>
      </button>
      {isOwner && onDelete && (
        <button
          className="action-btn delete-btn"
          onClick={() => {
            if (confirm('Delete this tweet?')) {
              onDelete(tweet.id)
            }
          }}
        >
          <span className="action-icon">🗑️</span>
        </button>
      )}
    </div>
  )
}
