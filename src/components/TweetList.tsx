'use client'

import { TweetItem } from './TweetItem'

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
  _count: {
    likes: number
    retweets: number
    replies: number
  }
  liked?: boolean
  retweeted?: boolean
  bookmarked?: boolean
}

interface TweetListProps {
  tweets: Tweet[]
  onLike: (id: string) => void
  onRetweet: (id: string) => void
  onReply: (id: string) => void
  onBookmark: (id: string) => void
  onDelete?: (id: string) => void
}

export function TweetList({ tweets, onLike, onRetweet, onReply, onBookmark, onDelete }: TweetListProps) {
  return (
    <div className="feed">
      {tweets.map((tweet) => (
        <TweetItem
          key={tweet.id}
          tweet={tweet}
          onLike={onLike}
          onRetweet={onRetweet}
          onReply={onReply}
          onBookmark={onBookmark}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
