import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { addClient, removeClient } from '@/lib/broadcast'

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id || `anon-${Math.random().toString(36).slice(2)}`

  const stream = new ReadableStream({
    start(controller) {
      addClient(userId, controller)

      // Send connected event
      const data = JSON.stringify({ type: 'connected', userId })
      controller.enqueue(`data: ${data}\n\n`)

      // Heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`: heartbeat\n\n`)
        } catch {
          clearInterval(heartbeat)
          removeClient(userId)
        }
      }, 30000)

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        removeClient(userId)
        try { controller.close() } catch {}
      })
    },
    cancel() {
      removeClient(userId)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
