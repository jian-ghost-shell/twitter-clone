# Twitter Clone 🐦

A full-featured Twitter clone built with Next.js, Prisma, and PostgreSQL.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.22-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

### Core Features
- **Post Tweets** - Create text tweets (max 280 characters)
- **Image Upload** - Attach images to tweets (stored as base64)
- **User Authentication** - Sign up / Sign in with NextAuth.js (Credentials)
- **Like/Unlike** - Like tweets
- **Retweet** - Retweet posts
- **Reply** - Reply to tweets
- **Bookmark** - Save tweets for later

### Social Features
- **User Profiles** - View user profiles with tweet history
- **Follow/Unfollow** - Follow other users
- **Timeline** - Home (all tweets) / Following (only followed users)
- **Search** - Search tweets and users

### UI/UX
- **Dark Mode** - Automatic dark mode based on system preference
- **Responsive Design** - Works on mobile and desktop
- **Twitter-style UI** - Familiar Twitter look and feel

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | CSS Variables, Tailwind CSS |
| Backend | Next.js API Routes |
| Auth | NextAuth.js v4 |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Deployment | Vercel |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jian-ghost-shell/twitter-clone.git
cd twitter-clone

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

## 📁 Project Structure

```
twitter-clone/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/          # API routes
│   │   │   ├── auth/     # NextAuth
│   │   │   ├── tweets/   # Tweet CRUD
│   │   │   ├── users/    # User profiles
│   │   │   ├── search/  # Search
│   │   │   ├── bookmarks/ # Bookmarks
│   │   │   └── upload/   # Image upload
│   │   ├── profile/     # Profile pages
│   │   ├── search/      # Search page
│   │   ├── bookmarks/    # Bookmarks page
│   │   └── tweet/       # Tweet detail page
│   ├── components/      # React components
│   │   ├── Feed.tsx
│   │   ├── TweetForm.tsx
│   │   ├── TweetItem.tsx
│   │   ├── TweetActions.tsx
│   │   └── AuthButton.tsx
│   └── lib/             # Utilities
│       ├── prisma.ts    # Prisma client
│       └── auth.ts      # NextAuth config
└── public/              # Static assets
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project on Vercel
3. Add environment variables:
   - `DATABASE_URL` - PostgreSQL connection string (Neon)
   - `NEXTAUTH_SECRET` - Random secret key
4. Deploy!

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions.

## 📱 Live Demo

**Production URL:** https://twitter-clone-pearl-two.vercel.app

## 📝 Documentation

- [DESIGN.md](./DESIGN.md) - Architecture and database design
- [TASKS.md](./TASKS.md) - Development tasks and progress
- [P1.md](./P1.md) - Future features and improvements
- [DEPLOY.md](./DEPLOY.md) - Deployment guide

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE for details.

---

Built with ❤️ using Next.js and Prisma
