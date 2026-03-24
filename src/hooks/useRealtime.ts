'use client'

import { useEffect, useRef, useCallback } from 'react'

type RealtimeEvent = {
  type: string
  payload: unknown
}

type EventHandler = (event: RealtimeEvent) => void

export function useRealtime(onEvent: EventHandler) {
  const onEventRef = useRef(onEvent)
  onEventRef.current = onEvent
  const esRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close()
    }

    const es = new EventSource('/api/events')
    esRef.current = es

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as RealtimeEvent
        onEventRef.current(event)
      } catch {}
    }

    es.onerror = () => {
      es.close()
      // Reconnect after 5s
      setTimeout(connect, 5000)
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      if (esRef.current) {
        esRef.current.close()
        esRef.current = null
      }
    }
  }, [connect])
}
