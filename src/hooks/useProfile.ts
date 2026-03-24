'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [localIsFollowing, setLocalIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)

  // Use useTweets for the user's tweets
  const {
    tweets,
    loading: tweetsLoading,
    handleLike,
    handleRetweet,
    handleReply,
    handleBookmark,
    handleDelete,
    refresh,
  } = useTweets({ endpoint: `/api/users/${userId}/tweets` })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.users.get(userId)
        setUser(userData)
        setLocalIsFollowing(userData.isFollowing)
        setFollowersCount(userData.followersCount)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
      setLoading(false)
    }

    if (userId) {
      fetchUser()
    }
  }, [userId])

  const follow = useCallback(async () => {
    if (!session?.user) {
      alert('Please sign in to follow')
      return
    }

    // Optimistic update
    setLocalIsFollowing(!localIsFollowing)
    setFollowersCount(prev => localIsFollowing ? prev - 1 : prev + 1)

    try {
      const data = localIsFollowing
        ? await api.users.unfollow(userId)
        : await api.users.follow(userId)
      setLocalIsFollowing(data.following)
      setFollowersCount(prev => data.following ? prev + 1 : prev - 1)
      // Refresh user data to get accurate counts
      const userData = await api.users.get(userId)
      setUser(userData)
    } catch (error) {
      console.error('Error following/unfollowing:', error)
      // Rollback
      setLocalIsFollowing(localIsFollowing)
      setFollowersCount(followersCount)
    }
  }, [session, userId, localIsFollowing, followersCount])

  return {
    user,
    tweets,
    loading: loading || tweetsLoading,
    follow,
    isFollowing: localIsFollowing,
    handleLike,
    handleRetweet,
    handleReply,
    handleBookmark,
    handleDelete,
  }
}
