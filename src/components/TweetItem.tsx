'use client'

import { useState } from 'react'
import Link from 'next/link'
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
}

export function TweetItem({ tweet, onLike, onRetweet, onReply, onBookmark }: TweetItemProps) {
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
          onLike={onLike}
          onRetweet={onRetweet}
          onReply={onReply}
          onBookmark={onBookmark}
        />
      </div>
    </div>
  )
}
