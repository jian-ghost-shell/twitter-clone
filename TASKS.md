# Twitter Clone - Tasks Tracker

## 📚 Technology Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 | Frontend + API |
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Prisma 5 | ORM |
| NextAuth.js + bcryptjs | Authentication |
| PostgreSQL (Neon) | Database |
| Vercel | Deployment |

---

## ✅ Completed Features

### Phase 1: Basic Tweet Functionality ✅
- [x] Prisma client setup
- [x] Tweet API routes (GET, POST, DELETE)
- [x] TweetForm component
- [x] Feed component (TweetList, TweetItem)
- [x] Image upload with preview
- [x] Click-to-expand images in feed

### Phase 2: User Authentication ✅
- [x] NextAuth.js setup (Credentials provider)
- [x] Sign in / Sign out pages
- [x] Session management
- [x] Username-based login (case-insensitive)
- [x] Bcrypt password hashing

### Phase 3: Interactions ✅
- [x] Like/Unlike tweets
- [x] Retweet
- [x] Reply to tweets
- [x] Bookmark tweets

### Phase 4: Social Features ✅
- [x] User profile pages (with tweet images)
- [x] Follow/Unfollow users
- [x] Timeline (Home / Following tabs)
- [x] Search (tweets and users)

### Additional Features ✅
- [x] Image upload (base64 storage)
- [x] Search (tweets and users)
- [x] Tweet detail page with replies
- [x] Dark mode (system preference)
- [x] Responsive design (max-width 800px on desktop)

---

## 📝 Notes

- Database: PostgreSQL (Neon) in production, SQLite locally
- Next.js 16 with App Router
- Prisma 5.x
- Deployment: Vercel
- Image storage: base64 in database (2MB limit)
