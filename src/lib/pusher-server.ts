import Pusher from 'pusher'

// Server-side Pusher instance
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
})

export default pusher

// Channel names
export const CHANNELS = {
  GLOBAL: 'private-global',
  USER_PREFIX: 'private-user-',
} as const

// Event types
export const EVENTS = {
  TWEET_CREATED: 'tweet:created',
  TWEET_DELETED: 'tweet:deleted',
  LIKE_UPDATED: 'like:updated',
  RETWEET_UPDATED: 'retweet:updated',
  NOTIFICATION: 'notification',
} as const

// Trigger a tweet:created event to all followers
export async function triggerTweetCreated(tweet: {
  id: string
  content: string
  userId: string
  user: { id: string; name: string | null; image: string | null }
  createdAt: string
}) {
  await pusher.trigger(CHANNELS.GLOBAL, EVENTS.TWEET_CREATED, { tweet })
}

// Trigger a like update to the tweet owner
export async function triggerLikeUpdated(tweetId: string, userId: string, liked: boolean) {
  await pusher.trigger(`${CHANNELS.USER_PREFIX}${userId}`, EVENTS.LIKE_UPDATED, {
    tweetId,
    liked,
    actorId: userId,
  })
}

// Trigger a notification to a specific user
export async function triggerNotification(userId: string, notification: {
  id: string
  type: string
  actorId: string
  tweetId?: string
}) {
  await pusher.trigger(`${CHANNELS.USER_PREFIX}${userId}`, EVENTS.NOTIFICATION, notification)
}
