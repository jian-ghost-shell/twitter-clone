import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteTweet, getTweetById } from '@/lib/services/tweetService'

// GET /api/tweets/[id] - Get a single tweet with replies
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ?? null

    const tweet = await getTweetById(id, userId)

    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }

    return NextResponse.json(tweet)
  } catch (error) {
    console.error('Error fetching tweet:', error)
    return NextResponse.json({ error: 'Failed to fetch tweet' }, { status: 500 })
  }
}

// DELETE /api/tweets/[id] - Delete a tweet
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteTweet(id, session.user.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting tweet:', error)
    if (error.message === 'Tweet not found') {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to delete tweet' }, { status: 500 })
  }
}
