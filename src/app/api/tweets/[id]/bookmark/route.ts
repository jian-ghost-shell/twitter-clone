import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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
    const userId = session.user.id

    // Check if tweet exists
    const tweet = await prisma.tweet.findUnique({
      where: { id: tweetId }
    })

    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_tweetId: {
          userId,
          tweetId
        }
      }
    })

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id }
      })
      return NextResponse.json({ bookmarked: false })
    }

    // Create bookmark
    await prisma.bookmark.create({
      data: {
        userId,
        tweetId
      }
    })

    return NextResponse.json({ bookmarked: true })
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 })
  }
}
