import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { triggerTweetCreated } from '@/lib/pusher-server'
import { retweetTweet } from '@/lib/services/tweetService'

// POST /api/tweets/[id]/retweet - Retweet a tweet
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: originalTweetId } = await params
    const { retweeted, retweet } = await retweetTweet(session.user.id, originalTweetId)

    // Broadcast to all followers' feeds when retweeting
    if (retweeted && retweet) {
      await triggerTweetCreated({
        id: retweet.id,
        content: retweet.content,
        userId: retweet.userId,
        user: retweet.user,
        createdAt: retweet.createdAt.toISOString(),
      }).catch(console.error)
    }

    return NextResponse.json({ retweeted })
  } catch (error: any) {
    console.error('Error retweeting:', error)
    if (error.message === 'Tweet not found') {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to retweet' }, { status: 500 })
  }
}
