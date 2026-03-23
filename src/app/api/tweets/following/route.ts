import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/tweets/following - Get tweets from followed users with cursor pagination
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = 20
    
    // If not logged in, return empty
    if (!session?.user?.id) {
      return NextResponse.json({ tweets: [], nextCursor: null })
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
      return NextResponse.json({ tweets: [], nextCursor: null })
    }

    // Get tweets from followed users
    const tweets = await prisma.tweet.findMany({
      where: {
        userId: { in: followingIds },
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : undefined),
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
      },
      take: limit + 1,
    })

    const hasMore = tweets.length > limit
    const results = hasMore ? tweets.slice(0, limit) : tweets
    const nextCursor = hasMore && results.length > 0
      ? results[results.length - 1].createdAt.toISOString()
      : null

    // Get user's likes and retweets
    const likes = await prisma.like.findMany({
      where: { userId, tweetId: { in: results.map(t => t.id) } },
      select: { tweetId: true }
    })
    const userLikes = likes.map(l => l.tweetId)

    const retweets = await prisma.retweet.findMany({
      where: { userId, tweetId: { in: results.map(t => t.id) } },
      select: { tweetId: true }
    })
    const userRetweets = retweets.map(r => r.tweetId)

    const tweetsWithStatus = results.map(tweet => ({
      ...tweet,
      liked: userLikes.includes(tweet.id),
      retweeted: userRetweets.includes(tweet.id)
    }))

    return NextResponse.json({ tweets: tweetsWithStatus, nextCursor })
  } catch (error) {
    console.error('Error fetching following tweets:', error)
    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 })
  }
}
