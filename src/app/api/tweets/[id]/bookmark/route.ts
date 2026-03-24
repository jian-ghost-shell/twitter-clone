import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { toggleBookmark } from '@/lib/services/tweetService'

// POST /api/tweets/[id]/bookmark - Toggle bookmark
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
    const { bookmarked } = await toggleBookmark(session.user.id, tweetId)
    return NextResponse.json({ bookmarked })
  } catch (error: any) {
    console.error('Error toggling bookmark:', error)
    if (error.message === 'Tweet not found') {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 })
  }
}
