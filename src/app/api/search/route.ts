import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/search?q=keyword - Search tweets and users
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ tweets: [], users: [] })
    }

    const searchTerm = query.trim()

    // Search tweets
    const tweets = await prisma.tweet.findMany({
      where: {
        content: {
          contains: searchTerm,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
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
      take: 20,
    })

    // Search users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { email: { contains: searchTerm } },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        _count: {
          select: {
            tweets: true,
            followedBy: true,
          },
        },
      },
      take: 10,
    })

    const usersWithCounts = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      tweetsCount: user._count.tweets,
      followersCount: user._count.followedBy,
    }))

    return NextResponse.json({
      tweets,
      users: usersWithCounts,
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
