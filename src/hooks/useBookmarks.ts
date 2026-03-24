'use client'

import { useQuery } from '@tanstack/react-query'
import { Tweet } from './useTweets'
import { api } from '@/lib/api'

interface UseBookmarksReturn {
  bookmarks: Tweet[]
  loading: boolean
}

export function useBookmarks(): UseBookmarksReturn {
  const { data, isLoading } = useQuery<Tweet[]>({
    queryKey: ['bookmarks'],
    queryFn: () => api.users.bookmarks(),
  })

  return {
    bookmarks: data ?? [],
    loading: isLoading,
  }
}
