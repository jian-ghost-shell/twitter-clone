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
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │   Home   │  │  Profile │  │       Auth         │  │
│  │  (Feed) │  │   Page   │  │  (NextAuth.js)   │  │
│  └────┬─────┘  └────┬─────┘  └────────┬───────────┘  │
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
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ /api/    │  │ /api/    │  │    /api/upload/      │  │
│  │ bookmarks│  │  search  │  │   (base64 images)   │  │
│  └──────────┘  └──────────┘  └──────────────────────┘  │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                           │
│  ┌─────────────────────┐  ┌─────────────────────────┐ │
│  │    Prisma ORM      │  │   PostgreSQL (Neon)   │ │
│  │  (Type-safe)      │  │                       │ │
│  └─────────────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Backend | Next.js API Routes |
| Auth | NextAuth.js v4 + bcryptjs |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Styling | CSS Variables (Light/Dark mode) |
| Deployment | Vercel |

---

## 🗂️ Project Structure

```
twitter-clone/
├── prisma/
│   ├── schema.prisma        # Database models
│   └── migrations/          # Migration files
│
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── page.tsx        # Home page
│   │   ├── layout.tsx      # Root layout
│   │   ├── globals.css     # Global styles
│   │   │
│   │   ├── api/           # API Routes
│   │   │   ├── auth/      # NextAuth endpoints
│   │   │   ├── tweets/    # Tweet CRUD + interactions
│   │   │   ├── users/     # User profiles + follow
│   │   │   ├── bookmarks/  # User bookmarks
│   │   │   ├── search/    # Search API
│   │   │   └── upload/    # Image upload (base64)
│   │   │
│   │   ├── profile/[id]/  # Profile page
│   │   ├── search/         # Search page
│   │   ├── bookmarks/      # Bookmarks page
│   │   └── tweet/[id]/    # Tweet detail page
│   │
│   ├── components/        # React components
│   │   ├── Feed.tsx
│   │   ├── TweetForm.tsx
│   │   ├── TweetItem.tsx
│   │   ├── TweetActions.tsx
│   │   ├── TweetList.tsx
│   │   └── AuthButton.tsx
│   │
│   └── lib/               # Utilities
│       ├── prisma.ts       # Prisma client
│       └── auth.ts         # NextAuth config
│
├── public/                 # Static assets
├── README.md
├── DESIGN.md
├── TASKS.md
├── P1.md
└── DEPLOY.md
```

---

## 🗃️ Database Models

### User
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| name | String? | Display name |
| username | String | Unique username (lowercase, case-insensitive login) |
| email | String? | Unique email |
| image | String? | Avatar URL |
| password | String? | Bcrypt hashed password |
| createdAt | DateTime | Creation timestamp |

### Tweet
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| content | String | Tweet text |
| image | String? | Base64 image data |
| createdAt | DateTime | Creation timestamp |
| userId | String | Author's ID |
| parentId | String? | Parent tweet (for replies) |

### Like
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Who liked |
| tweetId | String | Which tweet |

### Retweet
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Who retweeted |
| tweetId | String | Which tweet |

### Follow
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| followerId | String | Who follows |
| followingId | String | Who is followed |

### Bookmark
| Field | Type | Description |
|-------|------|-------------|
| id | String (cuid) | Primary key |
| userId | String | Who bookmarked |
| tweetId | String | Which tweet |

---

## 🔌 API Endpoints

### Tweets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tweets | Get all tweets |
| POST | /api/tweets | Create tweet |
| DELETE | /api/tweets/[id] | Delete tweet |
| GET | /api/tweets/following | Get timeline (followed users) |
| GET | /api/tweets/[id] | Get single tweet with replies |
| POST | /api/tweets/[id]/like | Like/unlike |
| POST | /api/tweets/[id]/retweet | Retweet/unretweet |
| POST | /api/tweets/[id]/reply | Reply to tweet |
| POST | /api/tweets/[id]/bookmark | Bookmark/unbookmark |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/[id] | Get profile |
| GET | /api/users/[id]/tweets | Get user's tweets |
| POST | /api/users/[id]/follow | Follow user |
| DELETE | /api/users/[id]/follow | Unfollow user |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/search?q= | Search tweets & users |
| GET | /api/bookmarks | Get user's bookmarks |
| POST | /api/upload | Upload image (base64) |
| GET/POST | /api/auth/[...nextauth] | NextAuth handlers |

---

## ✅ Completed Features

### Phase 1: Basic Tweet Functionality ✅
- [x] User signup/login (NextAuth - Credentials)
- [x] Post tweet (text + images)
- [x] View feed (all tweets)
- [x] Delete own tweets

### Phase 2: User Authentication ✅
- [x] NextAuth.js setup
- [x] Sign in/out pages
- [x] Session management

### Phase 3: Interactions ✅
- [x] Like/Unlike tweets
- [x] Retweet
- [x] Reply to tweets
- [x] Bookmark tweets

### Phase 4: Social Features ✅
- [x] User profile pages
- [x] Follow/Unfollow users
- [x] Timeline (Home / Following tabs)
- [x] Tweet detail page with replies

### Additional ✅
- [x] Search (tweets and users)
- [x] Dark mode (system preference)
- [x] Image upload (base64)
- [x] Image click-to-expand in feed
- [x] Username-based login (case-insensitive)
- [x] Bcrypt password hashing
- [x] Responsive desktop width (max 800px)

---

## 🌐 Deployment

- **Production:** https://twitter-clone-pearl-two.vercel.app
- **Database:** Neon (PostgreSQL)
- **Platform:** Vercel

See [DEPLOY.md](./DEPLOY.md) for deployment instructions.
