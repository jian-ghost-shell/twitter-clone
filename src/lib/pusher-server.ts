import Pusher from 'pusher'

// Server-side Pusher instance
const pusher = new Pusher({
  appId: (process.env.PUSHER_APP_ID || '').trim(),
  key: (process.env.PUSHER_KEY || '').trim(),
  secret: (process.env.PUSHER_SECRET || '').trim(),
  cluster: (process.env.PUSHER_CLUSTER || '').trim(),
  useTLS: true,
})

export default pusher

// Channel names
export const CHANNELS = {
  GLOBAL: 'public-global', // public - anyone can subscribe
  USER_PREFIX: 'private-user-', // private - requires auth
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
  console.log('[PUSHER] triggerTweetCreated called, channel:', CHANNELS.GLOBAL, 'event:', EVENTS.TWEET_CREATED)
  try {
    await pusher.trigger(CHANNELS.GLOBAL, EVENTS.TWEET_CREATED, { tweet })
    console.log('[PUSHER] triggerTweetCreated success')
  } catch (err) {
    console.error('[PUSHER] triggerTweetCreated error:', err)
  }
}

// Trigger a like update to the tweet owner
export async function triggerLikeUpdated(tweetId: string, userId: string, liked: boolean) {
  try {
    await pusher.trigger(`${CHANNELS.USER_PREFIX}${userId}`, EVENTS.LIKE_UPDATED, {
      tweetId,
      liked,
      actorId: userId,
    })
  } catch (err) {
    console.error('[PUSHER] triggerLikeUpdated error:', err)
  }
}

// Trigger a notification to a specific user
export async function triggerNotification(userId: string, notification: {
  id: string
  type: string
  actorId: string
  tweetId?: string
}) {
  console.log('[PUSHER] triggerNotification called for user:', userId, notification)
  try {
    await pusher.trigger(`${CHANNELS.USER_PREFIX}${userId}`, EVENTS.NOTIFICATION, notification)
    console.log('[PUSHER] triggerNotification success')
  } catch (err) {
    console.error('[PUSHER] triggerNotification error:', err)
  }
}
