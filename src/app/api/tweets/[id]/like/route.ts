import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    // Check if tweet exists
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId }
    })

    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_tweetId: {
          userId: session.user.id,
          tweetId
        }
      }
    })

    if (existingLike) {
      // Unlike - remove the like
      await prisma.like.delete({
        where: { id: existingLike.id }
      })
      return NextResponse.json({ liked: false })
    }

    // Create like
    await prisma.like.create({
      data: {
        userId: session.user.id,
        tweetId
      }
    })

    return NextResponse.json({ liked: true })
  } catch (error) {
    console.error('Error liking tweet:', error)
    return NextResponse.json({ error: 'Failed to like tweet' }, { status: 500 })
  }
}
