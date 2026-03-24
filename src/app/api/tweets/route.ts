import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { triggerTweetCreated } from '@/lib/pusher-server'

// GET /api/tweets - Get all tweets with cursor-based pagination
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor') // ISO date string
    const limit = 20

    const tweets = await prisma.tweet.findMany({
      where: cursor ? {
        createdAt: { lt: new Date(cursor) }
      } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        parent: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
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
                replies: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            retweets: true,
            replies: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit + 1, // take one extra to check if there's a next page
    })

    const hasMore = tweets.length > limit
    const results = hasMore ? tweets.slice(0, limit) : tweets
    const nextCursor = hasMore && results.length > 0
      ? results[results.length - 1].createdAt.toISOString()
      : null

    // Add liked/retweeted status for current user
    let userLikes: string[] = []
    let userRetweetOfIds: string[] = []

    if (userId) {
      const likes = await prisma.like.findMany({
        where: { userId, tweetId: { in: results.map(t => t.id) } },
        select: { tweetId: true }
      })
      userLikes = likes.map(l => l.tweetId)

      // Check if user has retweeted any of the original tweets
      const retweetTweetIds = results
        .map(t => t.retweetOfId || t.id)
      const userRetweets = await prisma.tweet.findMany({
        where: {
          userId,
          retweetOfId: { in: retweetTweetIds }
        },
        select: { retweetOfId: true }
      })
      userRetweetOfIds = userRetweets.map(r => r.retweetOfId!)
    }

    const tweetsWithStatus = results.map(tweet => ({
      ...tweet,
      liked: userLikes.includes(tweet.id),
      // A tweet is "retweeted" by user if it's a retweet that the user created,
      // OR if it's an original tweet that the user has retweeted
      retweeted: tweet.retweetOfId
        ? tweet.userId === userId  // it's a retweet, check if current user is the author
        : userRetweetOfIds.includes(tweet.id)  // it's original, check if user retweeted it
    }))

    return NextResponse.json({
      tweets: tweetsWithStatus,
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching tweets:', error)
    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 })
  }
}

// POST /api/tweets - Create a new tweet
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, image, userId, parentId } = body

    if (!content && !image) {
      return NextResponse.json({ error: 'Missing content or image' }, { status: 400 })
    }

    if (content && content.length > 280) {
      return NextResponse.json({ error: 'Tweet too long (max 280 chars)' }, { status: 400 })
    }

    const tweet = await prisma.tweet.create({
      data: {
        content: content || '',
        image: image || null,
        userId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Broadcast new tweet to all connected clients
    await triggerTweetCreated({
      id: tweet.id,
      content: tweet.content,
      userId: tweet.userId,
      user: tweet.user,
      createdAt: tweet.createdAt.toISOString(),
    }).catch(console.error)

    return NextResponse.json(tweet)
  } catch (error) {
    console.error('Error creating tweet:', error)
    return NextResponse.json({ error: 'Failed to create tweet' }, { status: 500 })
  }
}
