# Twitter Clone - Design Document

## 📁 Project Path
```
/Users/ghost/.openclaw/workspace/projects/twitter-clone
```

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│                    (Next.js App)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │   Home   │  │  Profile │  │       Auth           │  │
│  │  (Feed)  │  │   Page   │  │  (NextAuth.js)       │  │
│  └────┬─────┘  └────┬─────┘  └──────────┬───────────┘  │
│       │            │                     │              │
└───────┼────────────┼─────────────────────┼──────────────┘
        │            │                     │
        ▼            ▼                     ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer                            │
│              (Next.js Route Handlers)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ /api/    │  │ /api/    │  │    /api/auth/        │  │
│  │  tweets  │  │  users   │  │   (NextAuth)         │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                           │
│  ┌─────────────────────┐  ┌─────────────────────────┐ │
│  │    Prisma ORM        │  │    SQLite (dev.db)       │ │
│  │  (Type-safe queries) │  │                         │ │
│  └─────────────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React, Tailwind CSS |
| Backend | Next.js API Routes |
| Auth | NextAuth.js |
| Database | SQLite + Prisma ORM |
| Language | TypeScript |

---

## 🗂️ Project Structure

```
twitter-clone/
├── prisma/
│   ├── schema.prisma        # Database models
│   ├── dev.db              # SQLite database
│   └── migrations/         # Migration files
│
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── page.tsx        # Home page (Feed)
│   │   ├── layout.tsx     # Root layout
│   │   ├── globals.css    # Global styles
│   │   │
│   │   ├── api/           # API Routes
│   │   │   ├── auth/      # NextAuth endpoints
│   │   │   ├── tweets/    # Tweet CRUD
│   │   │   └── users/     # User profiles
│   │   │
│   │   └── profile/       # Profile page
│   │       └── [id]/
│   │
│   ├── components/        # React components
│   │   ├── Tweet.tsx
│   │   ├── Feed.tsx
│   │   ├── TweetForm.tsx
│   │   └── Navbar.tsx
│   │
│   ├── lib/               # Utilities
│   │   ├── prisma.ts      # Prisma client
│   │   └── auth.ts        # NextAuth config
│   │
│   └── types/             # TypeScript types
│
├── public/                # Static assets
├── package.json
└── DESIGN.md             # This file
```

---

## 🗃️ Database Models

### User
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| name | String? | Display name |
| email | String? | Unique email |
| image | String? | Avatar URL |
| createdAt | DateTime | Creation timestamp |

### Tweet
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| content | String | Tweet text (max 280) |
| createdAt | DateTime | Creation timestamp |
| userId | String | Author's ID |
| parentId | String? | Parent tweet (for replies) |

### Like
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Who liked |
| tweetId | String | Which tweet |
| createdAt | DateTime | |

### Retweet
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Who retweeted |
| tweetId | String | Which tweet |
| createdAt | DateTime | |

### Follow
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| followerId | String | Who follows |
| followingId | String | Who is followed |

---

## 🔌 API Endpoints

### Tweets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tweets | Get feed (all tweets) |
| POST | /api/tweets | Create new tweet |
| DELETE | /api/tweets/[id] | Delete tweet |
| POST | /api/tweets/[id]/like | Like a tweet |
| POST | /api/tweets/[id]/retweet | Retweet |
| POST | /api/tweets/[id]/reply | Reply to tweet |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/[id] | Get user profile |
| GET | /api/users/[id]/tweets | Get user's tweets |
| POST | /api/users/[id]/follow | Follow user |
| DELETE | /api/users/[id]/follow | Unfollow user |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | /api/auth/[...nextauth] | NextAuth handlers |

---

## 🎯 MVP Features

### Phase 1: Basic Tweet Functionality ✅
- [x] User signup/login (NextAuth - Credentials)
- [x] Post tweet (text only)
- [x] View feed (all tweets)
- [x] Delete own tweets

### Phase 2: User Authentication ✅
- [x] NextAuth.js setup
- [x] Sign in page
- [x] Session management

### Phase 3: Interactions ✅
- [x] Like/Unlike tweets
- [x] Retweet
- [x] Reply to tweets

### Phase 4: Social Features (In Progress)
- [ ] User profile page
- [ ] Follow/Unfollow users
- [ ] Timeline (only followed users)

### Phase 5: Nice to Have
- [ ] Real-time updates (WebSocket)
- [ ] Image upload
- [ ] Direct messages

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
http://localhost:3000
```
