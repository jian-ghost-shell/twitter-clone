import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/tweets/following - Get tweets from followed users
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // If not logged in, return empty
    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    const userId = session.user.id

    // Get IDs of users that current user follows
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    })

    const followingIds = following.map(f => f.followingId)

    // If not following anyone, return empty
    if (followingIds.length === 0) {
      return NextResponse.json([])
    }

    // Get tweets from followed users
    const tweets = await prisma.tweet.findMany({
      where: {
        userId: { in: followingIds }
      },
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
    const likes = await prisma.like.findMany({
      where: { userId, tweetId: { in: tweets.map(t => t.id) } },
      select: { tweetId: true }
    })
    const userLikes = likes.map(l => l.tweetId)

    const retweets = await prisma.retweet.findMany({
      where: { userId, tweetId: { in: tweets.map(t => t.id) } },
      select: { tweetId: true }
    })
    const userRetweets = retweets.map(r => r.tweetId)

    const tweetsWithStatus = tweets.map(tweet => ({
      ...tweet,
      liked: userLikes.includes(tweet.id),
      retweeted: userRetweets.includes(tweet.id)
    }))

    return NextResponse.json(tweetsWithStatus)
  } catch (error) {
    console.error('Error fetching following tweets:', error)
    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 })
  }
}
