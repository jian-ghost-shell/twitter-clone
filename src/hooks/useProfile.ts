'use client'

import { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTweets } from './useTweets'
import { api, User, Tweet } from '@/lib/api'

export type { User, Tweet }

interface UseProfileOptions {
  userId: string
}

interface UseProfileReturn {
  user: User | null
  tweets: Tweet[]
  loading: boolean
  follow: () => Promise<void>
  isFollowing: boolean
  handleLike: (tweetId: string) => Promise<void>
  handleRetweet: (tweetId: string) => Promise<void>
  handleReply: (tweetId: string) => Promise<void>
  handleBookmark: (tweetId: string) => Promise<void>
  handleDelete: (tweetId: string) => Promise<void>
}

export function useProfile({ userId }: UseProfileOptions): UseProfileReturn {
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  // User profile query
  const {
    data: user,
    isLoading: loading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => api.users.get(userId),
    enabled: !!userId,
  })

  // Use useTweets for the user's tweets
  const {
    tweets,
    loading: tweetsLoading,
    handleLike,
    handleRetweet,
    handleReply,
    handleBookmark,
    handleDelete,
  } = useTweets({ endpoint: `/api/users/${userId}/tweets` })

  // Follow/unfollow mutation with optimistic update
  const followMutation = useMutation({
    mutationFn: (follow: boolean) =>
      follow ? api.users.follow(userId) : api.users.unfollow(userId),
    onMutate: async (willFollow) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user', userId] })

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(['user', userId])

      // Optimistically update
      queryClient.setQueryData<User>(['user', userId], (old) => {
        if (!old) return old
        return {
          ...old,
          isFollowing: willFollow,
          followersCount: willFollow ? old.followersCount + 1 : old.followersCount - 1,
        }
      })

      return { previousUser }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(['user', userId], context.previousUser)
      }
    },
    onSuccess: (data) => {
      // Sync with server response
      queryClient.setQueryData<User>(['user', userId], (old) => {
        if (!old) return old
        return {
          ...old,
          isFollowing: data.following,
          followersCount: data.following ? old.followersCount + 1 : old.followersCount - 1,
        }
      })
    },
  })

  const follow = useCallback(async () => {
    if (!session?.user) {
      alert('Please sign in to follow')
      return
    }
    const willFollow = !user?.isFollowing
    followMutation.mutate(willFollow)
  }, [session, user?.isFollowing, followMutation])

  return {
    user: user ?? null,
    tweets,
    loading: loading || tweetsLoading,
    follow,
    isFollowing: user?.isFollowing ?? false,
    handleLike,
    handleRetweet,
    handleReply,
    handleBookmark,
    handleDelete,
  }
}
