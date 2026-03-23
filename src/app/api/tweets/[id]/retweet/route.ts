import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    const { id: tweetId } = await params

    // Check if tweet exists
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId }
    })

    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }

    // Check if already retweeted
    const existingRetweet = await prisma.retweet.findUnique({
      where: {
        userId_tweetId: {
          userId: session.user.id,
          tweetId
        }
      }
    })

    if (existingRetweet) {
      // Remove retweet
      await prisma.retweet.delete({
        where: { id: existingRetweet.id }
      })
      return NextResponse.json({ retweeted: false })
    }

    // Create retweet
    await prisma.retweet.create({
      data: {
        userId: session.user.id,
        tweetId
      }
    })

    // Create notification (but not for self-retweets)
    if (tweet.userId !== session.user.id) {
      await prisma.notification.create({
        data: {
          type: 'retweet',
          userId: tweet.userId,
          actorId: session.user.id,
          tweetId,
        },
      })
    }

    return NextResponse.json({ retweeted: true })
  } catch (error) {
    console.error('Error retweeting:', error)
    return NextResponse.json({ error: 'Failed to retweet' }, { status: 500 })
  }
}
