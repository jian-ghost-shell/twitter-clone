'use client'

import { useEffect, useRef } from 'react'
import PusherClient from 'pusher-js'

// Pusher client singleton
let pusherClient: PusherClient | null = null

function getPusherClient(): PusherClient {
  if (!pusherClient) {
    pusherClient = new PusherClient(
      (process.env.NEXT_PUBLIC_PUSHER_KEY || '').trim(),
      {
        cluster: (process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '').trim(),
        authEndpoint: '/api/pusher/auth',
      }
    )
  }
  return pusherClient
}

type RealtimeEvent = {
  type: string
  tweetId?: string
  liked?: boolean
  actorId?: string
  notification?: {
    id: string
    type: string
    actorId: string
    tweetId?: string
  }
  tweet?: unknown
}

type EventHandler = (event: RealtimeEvent) => void

export function useRealtime(onEvent: EventHandler, userId?: string) {
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent

  useEffect(() => {
    if (!userId) return

    const pusher = getPusherClient()

    // Subscribe to user's private channel
    const channel = pusher.subscribe(`private-user-${userId}`)

    channel.bind('notification', (data: { id: string; type: string; actorId: string; tweetId?: string }) => {
      onEventRef.current({ type: 'notification', notification: data })
    })

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('Pusher subscription succeeded')
    })

    channel.bind('pusher:subscription_error', (err: { error: string }) => {
      console.error('Pusher subscription error', err)
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`private-user-${userId}`)
    }
  }, [userId])
}
