// Real-time broadcast utility
// Note: In Vercel serverless, this only works within a single Lambda instance.
// For cross-instance real-time, integrate Pusher, Ably, or use Vercel's Beta MQTT/Edge Functions.

type BroadcastEvent = {
  type: 'tweet_created' | 'like_updated' | 'retweet_updated' | 'notification' | 'ping'
  payload: unknown
}

// In-memory clients registry (per-instance)
const clients = new Map<string, ReadableStreamDefaultController>()

export function addClient(userId: string, controller: ReadableStreamDefaultController) {
  clients.set(userId, controller)
}

export function removeClient(userId: string) {
  clients.delete(userId)
}

export function broadcast(event: BroadcastEvent, targetUserId?: string) {
  const data = `data: ${JSON.stringify(event)}\n\n`
  clients.forEach((controller, id) => {
    if (!targetUserId || id === targetUserId) {
      try {
        controller.enqueue(data)
      } catch {
        clients.delete(id)
      }
    }
  })
}

export function broadcastPing() {
  clients.forEach((controller, id) => {
    try {
      controller.enqueue(`: ping\n\n`)
    } catch {
      clients.delete(id)
    }
  })
}
