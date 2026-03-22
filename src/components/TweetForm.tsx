'use client'

import { useState, useRef } from 'react'

interface TweetFormProps {
  currentUser?: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  onTweetCreated?: () => void
  replyToId?: string
}

export function TweetForm({ currentUser, onTweetCreated, replyToId }: TweetFormProps) {
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (data.url) {
        setImage(data.url)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload image')
    }
    setUploading(false)
  }

  const handleRemoveImage = () => {
    setImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !image) return
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
        image,
        userId: currentUser.id,
        parentId: replyToId || null
      })
    })

    if (res.ok) {
      setContent('')
      setImage(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
          rows={image ? 2 : 3}
        />
        
        {image && (
          <div className="tweet-image-preview">
            <img src={image} alt="Upload" />
            <button type="button" onClick={handleRemoveImage} className="remove-image">
              ✕
            </button>
          </div>
        )}
      </div>

      <div className="tweet-form-footer">
        <div className="tweet-actions-left">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="image-input"
            id="image-upload"
          />
          <label htmlFor="image-upload" className="image-upload-btn">
            {uploading ? '⏳' : '🖼️'}
          </label>
          <span className={`char-count ${isOverLimit ? 'over-limit' : ''}`}>
            {charCount}/280
          </span>
        </div>
        <button
          type="submit"
          disabled={loading || (!content.trim() && !image) || isOverLimit}
          className="tweet-submit-btn"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  )
}
