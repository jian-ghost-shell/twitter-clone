'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { TweetActions } from './TweetActions'

interface TweetItemProps {
  tweet: {
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
  onLike: (id: string) => void
  onRetweet: (id: string) => void
  onReply: (id: string) => void
  onBookmark: (id: string) => void
  onDelete?: (id: string) => void
}

export function TweetItem({ tweet, onLike, onRetweet, onReply, onBookmark, onDelete }: TweetItemProps) {
  const { data: session } = useSession()
  const [imageExpanded, setImageExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  // This is a retweet - show original tweet
  if (tweet.retweetOf) {
    const original = tweet.retweetOf
    return (
      <div className="tweet">
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
          <div className="retweet-header">
            <span className="retweet-icon">🔁</span>
            <Link href={`/profile/${tweet.user.id}`} className="retweet-user">
              {tweet.user.name || 'Anonymous'} retweeted
            </Link>
          </div>

          {/* Original tweet */}
          <Link href={`/tweet/${original.id}`} className="original-tweet-link">
            <div className="tweet-header">
              <span className="tweet-name">
                {original.user.name || 'Anonymous'}
              </span>
              <span className="tweet-time">{formatDate(original.createdAt)}</span>
            </div>
            <div className="tweet-text">{original.content}</div>
            {original.image && (
              <div className="tweet-image">
                <img src={original.image} alt="Tweet image" />
              </div>
            )}
          </Link>

          <TweetActions
            tweet={{ ...tweet, id: original.id, user: original.user, _count: original._count }}
            currentUserId={session?.user?.id}
            onLike={onLike}
            onRetweet={onRetweet}
            onReply={onReply}
            onBookmark={onBookmark}
            onDelete={tweet.user.id === session?.user?.id ? onDelete : undefined}
          />
        </div>
      </div>
    )
  }

  // Normal tweet
  return (
    <div className="tweet">
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
        {/* Reply indicator */}
        {tweet.parent && (
          <Link href={`/tweet/${tweet.parent.id}`} className="reply-indicator-link">
            <span className="reply-indicator-text">
              Replying to @{tweet.parent.user.name || 'anonymous'}
            </span>
          </Link>
        )}

        <div className="tweet-header">
          <Link href={`/profile/${tweet.user.id}`} className="tweet-name">
            {tweet.user.name || 'Anonymous'}
          </Link>
          <span className="tweet-time">{formatDate(tweet.createdAt)}</span>
        </div>
        <div className="tweet-text">{tweet.content}</div>
        {tweet.image && (
          <div className={`tweet-image ${imageExpanded ? 'expanded' : ''}`}>
            <img
              src={tweet.image}
              alt="Tweet image"
              onClick={() => setImageExpanded(!imageExpanded)}
              style={{ cursor: 'pointer' }}
            />
          </div>
        )}
        <TweetActions
          tweet={tweet}
          currentUserId={session?.user?.id}
          onLike={onLike}
          onRetweet={onRetweet}
          onReply={onReply}
          onBookmark={onBookmark}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}
