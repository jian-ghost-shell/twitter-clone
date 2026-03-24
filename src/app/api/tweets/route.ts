import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { triggerTweetCreated } from '@/lib/pusher-server'
import { getTweets, createTweet } from '@/lib/services/tweetService'

// GET /api/tweets - Get all tweets with cursor-based pagination
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ?? null
    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')

    const { tweets, nextCursor } = await getTweets(cursor, userId)
    return NextResponse.json({ tweets, nextCursor })
  } catch (error) {
    console.error('Error fetching tweets:', error)
    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 })
  }
}

// POST /api/tweets - Create a new tweet
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, image, userId, parentId } = body

    if (!content && !image) {
      return NextResponse.json({ error: 'Missing content or image' }, { status: 400 })
    }

    if (content && content.length > 280) {
      return NextResponse.json({ error: 'Tweet too long (max 280 chars)' }, { status: 400 })
    }

    const tweet = await createTweet(session.user.id, content || '', image, parentId)

    // Broadcast new tweet to all connected clients
    console.log('[TWEETS_ROUTE] tweet created, triggering Pusher for:', tweet.id)
    try {
      await triggerTweetCreated({
        id: tweet.id,
        content: tweet.content,
        userId: tweet.userId,
        user: tweet.user,
        createdAt: tweet.createdAt.toISOString(),
      })
      console.log('[TWEETS_ROUTE] Pusher trigger done for:', tweet.id)
    } catch (err) {
      console.error('[TWEETS_ROUTE] Pusher trigger failed:', err)
    }

    return NextResponse.json(tweet)
  } catch (error) {
    console.error('Error creating tweet:', error)
    return NextResponse.json({ error: 'Failed to create tweet' }, { status: 500 })
  }
}
