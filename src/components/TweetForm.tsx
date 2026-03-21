'use client'

import { useState } from 'react'

interface TweetFormProps {
  currentUser?: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  onTweetCreated?: () => void
}

export function TweetForm({ currentUser, onTweetCreated }: TweetFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    if (!currentUser?.id) {
      alert('Please sign in to post')
      return
    }

    setLoading(true)
    const res = await fetch('/api/tweets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        userId: currentUser.id
      })
    })

    if (res.ok) {
      setContent('')
      onTweetCreated?.()
    }
    setLoading(false)
  }

  const charCount = content.length
  const isOverLimit = charCount > 280

  return (
    <form onSubmit={handleSubmit} className="tweet-form">
      <div className="tweet-input-wrapper">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          maxLength={300}
          className="tweet-textarea"
          rows={3}
        />
      </div>

      <div className="tweet-form-footer">
        <span className={`char-count ${isOverLimit ? 'over-limit' : ''}`}>
          {charCount}/280
        </span>
        <button
          type="submit"
          disabled={loading || !content.trim() || isOverLimit}
          className="tweet-submit-btn"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  )
}
