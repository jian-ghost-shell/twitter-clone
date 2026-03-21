# Twitter Clone - Tasks Tracker

## 📚 Technology Notes

### What is Prisma?
**Prisma = 数据库 ORM (Object-Relational Mapping)**

```
┌─────────────────────────────────────┐
│         Your TypeScript Code        │
│   const tweets = await prisma.tweet │
│   .findMany()                       │
└─────────────────┬───────────────────┘
                  │ Prisma ORM
                  ▼ (翻译: TS ↔ SQL)
┌─────────────────────────────────────┐
│        SQLite Database              │
│   (prisma/dev.db)                  │
└─────────────────────────────────────┘
```

**为什么用 Prisma:**
| 传统写法 | Prisma 写法 |
|---------|------------|
| `SELECT * FROM tweets` | `prisma.tweet.findMany()` |
| 手写 SQL | 自动生成类型安全的查询 |
| 改数据库要改很多代码 | 改 schema 就自动更新 |

→ 简单说：Prisma 让你用 TypeScript 操作数据库，像操作普通对象一样

---

## 📋 Project Setup (✅ Done)
- [x] Initialize Next.js project with TypeScript + Tailwind
- [x] Install Prisma + SQLite
- [x] Define database schema (User, Tweet, Like, Retweet, Follow)
- [x] Run initial migration
- [x] Create DESIGN.md

---

## 🎯 MVP Tasks

### Phase 1: Basic Tweet Functionality
- [x] **1.1** Create Prisma client helper (`src/lib/prisma.ts`) ✅
  - **什么是 Prisma?** 数据库 ORM (Object-Relational Mapping)
  - **作用:** 把 TypeScript 代码翻译成 SQL，操作数据库像操作普通对象
  - **为什么用它:** 类型安全、自动补全、不用手写 SQL

- [x] **1.2** Create Tweet API routes ✅
  - GET /api/tweets - 获取所有 tweets
  - POST /api/tweets - 创建新 tweet
  - DELETE /api/tweets/[id] - 删除 tweet

- [x] **1.3** Create TweetForm component ✅
  - 文本输入框 (最多 280 字符)
  - 提交按钮
  - 调用 POST /api/tweets

- [x] **1.4** Create Feed component ✅
  - 获取 /api/tweets
  - 显示推文列表

- [x] **1.5** Update home page ✅
  - 集成 TweetForm + Feed
  - 添加 Twitter 风格样式

- [x] **3.1** Like/Unlike tweets ✅
  - API: POST /api/tweets/[id]/like
  - UI: 点击爱心变粉色

- [x] **3.2** Retweet ✅
  - API: POST /api/tweets/[id]/retweet
  - UI: 点击🔁变绿色

- [x] **3.3** Reply to tweets ✅
  - API: POST /api/tweets/[id]/reply
  - UI: 点击💬弹出输入框

- [x] **4.1** User profile page ✅
  - Page: /profile/[id]
  - 显示用户信息、推文数、粉丝数

- [x] **4.2** Follow/Unfollow users ✅
  - API: POST/DELETE /api/users/[id]/follow
  - UI: Profile 页面 Follow 按钮
- [ ] **1.2** Create Tweet API routes
  - [ ] GET /api/tweets - Get all tweets
  - [ ] POST /api/tweets - Create tweet
  - [ ] DELETE /api/tweets/[id] - Delete tweet
- [ ] **1.3** Create TweetForm component (post new tweet)
- [ ] **1.4** Create Feed component (display tweets)
- [ ] **1.5** Update home page to show feed

### Phase 2: User Authentication
- [x] **2.1** Setup NextAuth.js ✅
  - Credentials provider
  - Session management
  - Sign in page
- [ ] **2.2** Create auth API routes
- [ ] **2.3** Add login/logout UI
- [ ] **2.4** Link tweets to authenticated users

### Phase 3: Interactions
- [ ] **3.1** Like/Unlike tweets
- [ ] **3.2** Retweet
- [ ] **3.3** Reply to tweets

### Phase 4: Social Features
- [ ] **4.1** User profile page
- [ ] **4.2** Follow/Unfollow users
- [ ] **4.3** Timeline (only followed users)

---

## 🚧 Current Progress

**Status:** Phase 1.1 - Starting

---

## 📝 Notes

- Using SQLite for local development
- Next.js 15 (App Router)
- Prisma 7.x
