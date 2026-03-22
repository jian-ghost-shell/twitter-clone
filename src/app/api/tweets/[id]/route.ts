import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// GET /api/tweets/[id] - Get a single tweet with replies
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const tweet = await prisma.tweet.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
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
        replies: {
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
          }
        },
        _count: {
          select: {
            likes: true,
            retweets: true,
            replies: true
          }
        }
      }
    })

    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 })
    }

    // Check if user liked/retweeted
    let liked = false, retweeted = false
    if (userId) {
      const like = await prisma.like.findUnique({
        where: { userId_tweetId: { userId, tweetId: id } }
      })
      liked = !!like

      const retweet = await prisma.retweet.findUnique({
        where: { userId_tweetId: { userId, tweetId: id } }
      })
      retweeted = !!retweet
    }

    return NextResponse.json({
      ...tweet,
      liked,
      retweeted
    })
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
