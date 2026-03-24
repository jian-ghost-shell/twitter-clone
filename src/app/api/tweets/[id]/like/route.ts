import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { triggerNotification } from '@/lib/pusher-server'
import { likeTweet } from '@/lib/services/tweetService'

// POST /api/tweets/[id]/like - Like a tweet
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: tweetId } = await params
    const { liked, notification } = await likeTweet(session.user.id, tweetId)

    // Send real-time notification (only when liking, not unliking)
    if (liked && notification) {
      await triggerNotification(session.user.id, {
        id: notification.id,
        type: 'like',
        actorId: session.user.id,
        tweetId,
      }).catch(console.error)
    }

    return NextResponse.json({ liked })
  } catch (error: any) {
    console.error('Error liking tweet:', error)
    if (error.message === 'Tweet not found') {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to like tweet' }, { status: 500 })
  }
}
