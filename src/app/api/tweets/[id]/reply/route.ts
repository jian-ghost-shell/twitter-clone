import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { triggerNotification, triggerTweetCreated } from '@/lib/pusher-server'

// POST /api/tweets/[id]/reply - Reply to a tweet
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: parentId } = await params
    const body = await request.json()
    const { content } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Check if parent tweet exists
    const parentTweet = await prisma.tweet.findUnique({
      where: { id: parentId }
    })

    if (!parentTweet) {
      return NextResponse.json({ error: 'Parent tweet not found' }, { status: 404 })
    }

    // Create reply
    const reply = await prisma.tweet.create({
      data: {
        content,
        userId: session.user.id,
        parentId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    })

    // Broadcast new reply to all followers
    await triggerTweetCreated({
      id: reply.id,
      content: reply.content,
      userId: reply.userId,
      user: reply.user,
      createdAt: reply.createdAt.toISOString(),
    }).catch(console.error)

    // Create notification (but not for self-replies)
    if (parentTweet.userId !== session.user.id) {
      const notification = await prisma.notification.create({
        data: {
          type: 'reply',
          userId: parentTweet.userId,
          actorId: session.user.id,
          tweetId: reply.id,
        },
      })

      // Real-time notification
      await triggerNotification(parentTweet.userId, {
        id: notification.id,
        type: 'reply',
        actorId: session.user.id,
        tweetId: reply.id,
      }).catch(console.error)
    }

    return NextResponse.json(reply)
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
  }
}
