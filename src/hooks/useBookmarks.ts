'use client'

import { useState, useEffect } from 'react'
import { Tweet } from './useTweets'
import { api } from '@/lib/api'

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
        const data = await api.users.bookmarks()
        setBookmarks(data)
      } catch (error) {
        console.error('Error fetching bookmarks:', error)
      }
      setLoading(false)
    }

    fetchBookmarks()
  }, [])

  return { bookmarks, loading }
}
