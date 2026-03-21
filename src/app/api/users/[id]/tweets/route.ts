import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/users/[id]/tweets - Get user's tweets
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const tweets = await prisma.tweet.findMany({
      where: { userId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        _count: {
          select: {
            likes: true,
            retweets: true,
            replies: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get user's likes and retweets
    let userLikes: string[] = []
    let userRetweets: string[] = []

    if (userId) {
      const likes = await prisma.like.findMany({
        where: { userId, tweetId: { in: tweets.map(t => t.id) } },
        select: { tweetId: true }
      })
      userLikes = likes.map(l => l.tweetId)

      const retweets = await prisma.retweet.findMany({
        where: { userId, tweetId: { in: tweets.map(t => t.id) } },
        select: { tweetId: true }
      })
      userRetweets = retweets.map(r => r.tweetId)
    }

    const tweetsWithStatus = tweets.map(tweet => ({
      ...tweet,
      liked: userLikes.includes(tweet.id),
      retweeted: userRetweets.includes(tweet.id)
    }))

    return NextResponse.json(tweetsWithStatus)
  } catch (error) {
    console.error('Error fetching user tweets:', error)
    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 })
  }
}
