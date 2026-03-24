import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { triggerNotification, triggerTweetCreated } from '@/lib/pusher-server'

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

    // Check if original tweet exists
    const originalTweet = await prisma.tweet.findUnique({
      where: { id: originalTweetId }
    })

    if (!originalTweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }

    // Check if already retweeted by this user (look for existing retweet tweet)
    const existingRetweet = await prisma.tweet.findFirst({
      where: {
        userId: session.user.id,
        retweetOfId: originalTweetId
      }
    })

    if (existingRetweet) {
      // Remove retweet
      await prisma.tweet.delete({
        where: { id: existingRetweet.id }
      })
      return NextResponse.json({ retweeted: false })
    }

    // Create a new tweet that is a retweet of the original
    const retweetTweet = await prisma.tweet.create({
      data: {
        content: '',
        userId: session.user.id,
        retweetOfId: originalTweetId,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true }
        }
      }
    })

    // Broadcast to all followers' feeds
    await triggerTweetCreated({
      id: retweetTweet.id,
      content: retweetTweet.content,
      userId: retweetTweet.userId,
      user: retweetTweet.user,
      createdAt: retweetTweet.createdAt.toISOString(),
    }).catch(console.error)

    // Create notification (but not for self-retweets)
    if (originalTweet.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: 'retweet',
          userId: originalTweet.userId,
          actorId: session.user.id,
          tweetId: originalTweetId,
        },
      })
    }

    return NextResponse.json({ retweeted: true })
  } catch (error) {
    console.error('Error retweeting:', error)
    return NextResponse.json({ error: 'Failed to retweet' }, { status: 500 })
  }
}
