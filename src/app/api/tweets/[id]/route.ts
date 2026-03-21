import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE /api/tweets/[id] - Delete a tweet
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if tweet exists
    const tweet = await prisma.tweet.findUnique({
      where: { id },
    })

    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }

    // Delete the tweet (cascades to likes and retweets)
    await prisma.tweet.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tweet:', error)
    return NextResponse.json({ error: 'Failed to delete tweet' }, { status: 500 })
  }
}
