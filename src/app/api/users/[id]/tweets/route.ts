import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getTweetsByUser } from '@/lib/services/tweetService'

// GET /api/users/[id]/tweets - Get user's tweets
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ?? null

    const tweets = await getTweetsByUser(id, userId)
    return NextResponse.json(tweets)
  } catch (error) {
    console.error('Error fetching user tweets:', error)
    return NextResponse.json({ error: 'Failed to fetch tweets' }, { status: 500 })
  }
}
