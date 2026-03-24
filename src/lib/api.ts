// Shared TypeScript interfaces
export interface TweetUser {
  id: string
  name: string | null
  image: string | null
}

export interface TweetParent {
  id: string
  content: string
  user: TweetUser
}

export interface TweetRetweetOf {
  id: string
  content: string
  image: string | null
  createdAt: string
  user: TweetUser
  _count: { likes: number; retweets: number; replies: number }
}

export interface TweetCount {
  likes: number
  retweets: number
  replies: number
}

export interface Tweet {
  id: string
  content: string
  image: string | null
  createdAt: string
  user: TweetUser
  parent?: TweetParent | null
  retweetOf?: TweetRetweetOf | null
  _count: TweetCount
  liked?: boolean
  retweeted?: boolean
  bookmarked?: boolean
  replies?: any[]
}

export interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
  createdAt: string
  followersCount: number
  followingCount: number
  tweetsCount: number
  isFollowing: boolean
}

export type NotificationType = 'like' | 'retweet' | 'reply' | 'follow'

export interface NotificationActor {
  id: string
  name: string | null
  username: string
  image: string | null
}

export interface NotificationTweet {
  id: string
  content: string
}

export interface Notification {
  id: string
  type: NotificationType
  actor: NotificationActor
  tweet?: NotificationTweet | null
  read: boolean
  createdAt: string
}

// Fetcher helper
async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  return res.json()
}

export interface SearchResults {
  tweets: Tweet[]
  users: User[]
}

// Centralized API client
export const api = {
  tweets: {
    list: (params?: { cursor?: string }) =>
      fetcher<{ tweets: Tweet[]; nextCursor: string | null }>(
        `/api/tweets${params?.cursor ? `?cursor=${params.cursor}` : ''}`
      ),
    byUser: (userId: string) =>
      fetcher<Tweet[]>(`/api/users/${userId}/tweets`),
    create: (data: { content: string; image?: string; parentId?: string | null }) =>
      fetcher<Tweet>('/api/tweets', { method: 'POST', body: JSON.stringify(data) }),
    delete: (tweetId: string) =>
      fetcher<void>(`/api/tweets/${tweetId}`, { method: 'DELETE' }),
    like: (tweetId: string) =>
      fetcher<{ liked: boolean }>(`/api/tweets/${tweetId}/like`, { method: 'POST' }),
    retweet: (tweetId: string) =>
      fetcher<{ retweeted: boolean }>(`/api/tweets/${tweetId}/retweet`, { method: 'POST' }),
    reply: (tweetId: string, content: string) =>
      fetcher<Tweet>(`/api/tweets/${tweetId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    bookmark: (tweetId: string) =>
      fetcher<{ bookmarked: boolean }>(`/api/tweets/${tweetId}/bookmark`, { method: 'POST' }),
    get: (tweetId: string) =>
      fetcher<Tweet>(`/api/tweets/${tweetId}`),
  },
  users: {
    get: (userId: string) => fetcher<User>(`/api/users/${userId}`),
    follow: (userId: string) =>
      fetcher<{ following: boolean }>(`/api/users/${userId}/follow`, { method: 'POST' }),
    unfollow: (userId: string) =>
      fetcher<{ following: boolean }>(`/api/users/${userId}/follow`, { method: 'DELETE' }),
    following: () => fetcher<Tweet[]>('/api/tweets/following'),
    bookmarks: () => fetcher<Tweet[]>('/api/bookmarks'),
    search: (query: string) =>
      fetcher<User[]>(`/api/users/search?q=${encodeURIComponent(query)}`),
  },
  notifications: {
    list: () => fetcher<Notification[]>(`/api/notifications`),
    markRead: (id: string) =>
      fetcher<void>(`/api/notifications/read`, {
        method: 'PUT',
        body: JSON.stringify({ id }),
      }),
  },
  search: {
    all: (q: string) =>
      fetcher<SearchResults>(`/api/search?q=${encodeURIComponent(q)}`),
  },
}
