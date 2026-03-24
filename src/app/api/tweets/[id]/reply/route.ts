import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { triggerNotification, triggerTweetCreated } from '@/lib/pusher-server'
import { replyToTweet } from '@/lib/services/tweetService'

// POST /api/tweets/[id]/reply - Reply to a tweet
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: parentId } = await params
    const body = await request.json()
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const { reply, notification } = await replyToTweet(session.user.id, parentId, content)

    // Broadcast new reply to all followers
    await triggerTweetCreated({
      id: reply.id,
      content: reply.content,
      userId: reply.userId,
      user: reply.user,
      createdAt: reply.createdAt.toISOString(),
    }).catch(console.error)

    // Real-time notification
    if (notification) {
      await triggerNotification(session.user.id, {
        id: notification.id,
        type: 'reply',
        actorId: session.user.id,
        tweetId: reply.id,
      }).catch(console.error)
    }

    return NextResponse.json(reply)
  } catch (error: any) {
    console.error('Error creating reply:', error)
    if (error.message === 'Parent tweet not found') {
      return NextResponse.json({ error: 'Parent tweet not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
  }
}
