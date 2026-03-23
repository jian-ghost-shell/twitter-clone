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
        retweetOf: {
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

    // Get user's likes
    let userLikes: string[] = []
    let userRetweetOfIds: string[] = []

    if (userId) {
      const likes = await prisma.like.findMany({
        where: { userId, tweetId: { in: tweets.map(t => t.id) } },
        select: { tweetId: true }
      })
      userLikes = likes.map(l => l.tweetId)

      // Get tweets this user has retweeted (via retweetOfId)
      const retweetTweetIds = tweets.map(t => t.retweetOfId || t.id)
      const userRetweets = await prisma.tweet.findMany({
        where: {
          userId,
          retweetOfId: { in: retweetTweetIds }
        },
        select: { retweetOfId: true }
      })
      userRetweetOfIds = userRetweets.map(r => r.retweetOfId!)
    }

    const tweetsWithStatus = tweets.map(tweet => ({
      ...tweet,
      liked: userLikes.includes(tweet.id),
      retweeted: tweet.retweetOfId
        ? tweet.userId === userId
        : userRetweetOfIds.includes(tweet.id)
    }))

    return NextResponse.json(tweetsWithStatus)
  } catch (error) {
    console.error('Error fetching user tweets:', error)
    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 })
  }
}
