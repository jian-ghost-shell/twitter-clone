# Deploy Twitter Clone to Vercel

## Prerequisites

### 1. GitHub Account
- Need a GitHub account to store the code
- Create a new repository for the project

### 2. Database Change (SQLite → PostgreSQL)
Vercel doesn't support SQLite in production. Options:

| Option | Free Tier | Pros | Cons |
|--------|-----------|------|------|
| **Neon** | 512MB | Very popular, easy setup | Cold starts (slow first query) |
| **Turso** | 1GB | SQLite compatible, fast | Less known |

**Chosen:** Neon (most popular, well-documented)

### 3. Environment Variables
Need to set:
- `DATABASE_URL` - PostgreSQL connection string from Neon
- `NEXTAUTH_URL` - Your Vercel domain
- `NEXTAUTH_SECRET` - Random secret key (can reuse current one)

---

## Steps to Deploy

### Step 1: Push Code to GitHub
```bash
# Create git repo (if not already)
cd projects/twitter-clone
git init
git add .
git commit -m "Twitter Clone - MVP"

# Create GitHub repo and push
# (Do this manually on GitHub.com)
```

### Step 2: Set Up Neon Database
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create new project: "twitter-clone"
4. Copy connection string (format: `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`)

### Step 3: Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Add New Project → Import from GitHub
4. Select the twitter-clone repository
5. Add Environment Variables:
   - `DATABASE_URL` = Neon connection string
   - `NEXTAUTH_URL` = (will be auto-set by Vercel)
   - `NEXTAUTH_SECRET` = (generate new one)
6. Click Deploy!

### Step 4: Update Prisma Schema
Need to change SQLite to PostgreSQL in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run:
```bash
npx prisma db push
```

---

## Current Project Structure

```
twitter-clone/
├── prisma/
│   ├── schema.prisma    # Needs update for PostgreSQL
│   └── dev.db          # Local SQLite (don't push)
├── src/
│   ├── app/            # Next.js app
│   ├── components/     # React components
│   └── lib/            # Prisma + Auth
├── .env                # Local only (don't push)
└── P1.md              # Future features
```

---

## Notes

- Don't commit `.env` file to GitHub (already in .gitignore)
- The database will be empty after deployment - need to seed again
- NextAuth might show warnings in production (need to fix NEXTAUTH_URL)
