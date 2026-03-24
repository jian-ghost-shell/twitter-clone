'use client'

import { useState, useEffect } from 'react'
import { Tweet } from './useTweets'

interface UseBookmarksReturn {
  bookmarks: Tweet[]
  loading: boolean
}

export function useBookmarks(): UseBookmarksReturn {
  const [bookmarks, setBookmarks] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await fetch('/api/bookmarks')
        const data = await res.json()
        if (Array.isArray(data)) {
          setBookmarks(data)
        } else if (data.tweets) {
          setBookmarks(data.tweets)
        }
      } catch (error) {
        console.error('Error fetching bookmarks:', error)
      }
      setLoading(false)
    }

    fetchBookmarks()
  }, [])

  return { bookmarks, loading }
}
