'use client'

import { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, InfiniteData } from '@tanstack/react-query'
import { api, Tweet } from '@/lib/api'

export type { Tweet }

interface UseTweetsOptions {
  endpoint?: string
  refreshTrigger?: number
}

interface UseTweetsReturn {
  tweets: Tweet[]
  loading: boolean
  hasMore: boolean
  fetchMore: () => void
  refresh: () => void
  handleLike: (tweetId: string) => Promise<void>
  handleRetweet: (tweetId: string) => Promise<void>
  handleReply: (tweetId: string) => Promise<void>
  handleBookmark: (tweetId: string) => Promise<void>
  handleDelete: (tweetId: string) => Promise<void>
  prependTweet: (tweet: Tweet) => void
}

type PaginatedTweets = { tweets: Tweet[]; nextCursor: string | null }

async function fetchTweets({ pageParam = null }: { pageParam?: string | null }): Promise<PaginatedTweets> {
  const params = pageParam ? `?cursor=${pageParam}` : ''
  const res = await fetch(`/api/tweets${params}`)
  if (!res.ok) throw new Error('Failed to fetch tweets')
  return res.json()
}

async function fetchUserTweets(userId: string): Promise<{ tweets: Tweet[]; nextCursor: null }> {
  const tweets = await api.tweets.byUser(userId)
  return { tweets, nextCursor: null }
}

async function fetchFollowingTweets(): Promise<{ tweets: Tweet[]; nextCursor: null }> {
  const tweets = await api.users.following()
  return { tweets, nextCursor: null }
}

export function useTweets({ endpoint = '/api/tweets', refreshTrigger = 0 }: UseTweetsOptions = {}): UseTweetsReturn {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  // Determine which query function to use
  const isMainFeed = endpoint === '/api/tweets'
  const isFollowingFeed = endpoint === '/api/tweets/following'
  const isUserTweets = endpoint.startsWith('/api/users/') && endpoint.includes('/tweets')

  const userId = isUserTweets ? endpoint.split('/')[3] : null

  const queryFn = isUserTweets && userId
    ? () => fetchUserTweets(userId)
    : isFollowingFeed
    ? fetchFollowingTweets
    : fetchTweets

  const queryKey = isUserTweets && userId
    ? ['tweets', 'user', userId]
    : isFollowingFeed
    ? ['tweets', 'following']
    : ['tweets', 'timeline']

  const {
    data,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const tweets = data?.pages.flatMap((page) => page.tweets) ?? []

  const prependTweet = useCallback((tweet: Tweet) => {
    queryClient.setQueryData<InfiniteData<PaginatedTweets>>(queryKey, (old) => {
      if (!old) return { pages: [{ tweets: [tweet], nextCursor: null }], pageParams: [null] }
      const firstPage = old.pages[0]
      const newFirstPage = { ...firstPage, tweets: [tweet, ...firstPage.tweets] }
      return { ...old, pages: [newFirstPage, ...old.pages.slice(1)] }
    })
  }, [queryClient, queryKey])

  // Like mutation with optimistic update
  const likeMutation = useMutation({
    mutationFn: (tweetId: string) => api.tweets.like(tweetId),
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<InfiniteData<PaginatedTweets>>(queryKey)
      queryClient.setQueryData<InfiniteData<PaginatedTweets>>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            tweets: page.tweets.map((t) => {
              if (t.id !== tweetId) return t
              const isCurrentlyLiked = t.liked || false
              return {
                ...t,
                liked: !isCurrentlyLiked,
                _count: {
                  ...t._count,
                  likes: isCurrentlyLiked ? t._count.likes - 1 : t._count.likes + 1,
                },
              }
            }),
          })),
        }
      })
      return { previousData }
    },
    onError: (_err, _tweetId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
  })

  // Retweet mutation with optimistic update
  const retweetMutation = useMutation({
    mutationFn: (tweetId: string) => api.tweets.retweet(tweetId),
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<InfiniteData<PaginatedTweets>>(queryKey)
      queryClient.setQueryData<InfiniteData<PaginatedTweets>>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            tweets: page.tweets.map((t) => {
              if (t.id !== tweetId) return t
              const isCurrentlyRetweeted = t.retweeted || false
              return {
                ...t,
                retweeted: !isCurrentlyRetweeted,
                _count: {
                  ...t._count,
                  retweets: isCurrentlyRetweeted ? t._count.retweets - 1 : t._count.retweets + 1,
                },
              }
            }),
          })),
        }
      })
      return { previousData }
    },
    onError: (_err, _tweetId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
  })

  // Bookmark mutation with optimistic update
  const bookmarkMutation = useMutation({
    mutationFn: (tweetId: string) => api.tweets.bookmark(tweetId),
    onMutate: async (tweetId) => {
      await queryClient.cancelQueries({ queryKey })
      const previousData = queryClient.getQueryData<InfiniteData<PaginatedTweets>>(queryKey)
      queryClient.setQueryData<InfiniteData<PaginatedTweets>>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            tweets: page.tweets.map((t) => {
              if (t.id !== tweetId) return t
              return { ...t, bookmarked: !(t.bookmarked || false) }
            }),
          })),
        }
      })
      return { previousData }
    },
    onError: (_err, _tweetId, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (tweetId: string) => api.tweets.delete(tweetId),
    onSuccess: (_data, tweetId) => {
      queryClient.setQueryData<InfiniteData<PaginatedTweets>>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            tweets: page.tweets.filter((t) => t.id !== tweetId),
          })),
        }
      })
    },
  })

  const handleLike = useCallback(async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to like')
      return
    }
    likeMutation.mutate(tweetId)
  }, [session, likeMutation])

  const handleRetweet = useCallback(async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to retweet')
      return
    }
    retweetMutation.mutate(tweetId)
  }, [session, retweetMutation])

  const handleReply = useCallback(async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to reply')
      return
    }
    const content = prompt('Write your reply:')
    if (!content?.trim()) return
    try {
      await api.tweets.reply(tweetId, content)
      refetch()
    } catch (error) {
      console.error('Error creating reply:', error)
    }
  }, [session, refetch])

  const handleBookmark = useCallback(async (tweetId: string) => {
    if (!session?.user) {
      alert('Please sign in to bookmark')
      return
    }
    bookmarkMutation.mutate(tweetId)
  }, [session, bookmarkMutation])

  const handleDelete = useCallback(async (tweetId: string) => {
    deleteMutation.mutate(tweetId)
  }, [deleteMutation])

  const refresh = useCallback(() => {
    refetch()
  }, [refetch])

  const fetchMore = useCallback(() => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }, [hasNextPage, fetchNextPage])

  return {
    tweets,
    loading,
    hasMore: hasNextPage ?? false,
    fetchMore,
    refresh,
    handleLike,
    handleRetweet,
    handleReply,
    handleBookmark,
    handleDelete,
    prependTweet,
  }
}
