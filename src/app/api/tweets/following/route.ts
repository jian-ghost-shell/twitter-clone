import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getFollowingTweets } from '@/lib/services/tweetService'

// GET /api/tweets/following - Get tweets from followed users with cursor pagination
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ tweets: [], nextCursor: null })
    }

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')

    const { tweets, nextCursor } = await getFollowingTweets(session.user.id, cursor)
    return NextResponse.json({ tweets, nextCursor })
  } catch (error) {
    console.error('Error fetching following tweets:', error)
    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 })
  }
}
