import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Pusher from 'pusher'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await request.formData()
  const socketId = data.get('socket_id') as string
  const channel = data.get('channel_name') as string

  if (!socketId || !channel) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID!,
    key: process.env.PUSHER_KEY!,
    secret: process.env.PUSHER_SECRET!,
    cluster: process.env.PUSHER_CLUSTER!,
    useTLS: true,
  })

  // For private channels, authorize based on channel access
  if (channel.startsWith('private-user-')) {
    const channelUserId = channel.replace('private-user-', '')
    // Only allow user to subscribe to their own channel
    if (channelUserId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
  // private-global is open to all authenticated users

  const auth = pusher.authorizeChannel(socketId, channel)
  return NextResponse.json(auth)
}
