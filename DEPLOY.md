# Deploy Twitter Clone to Vercel

## Live Demo

**Production URL:** https://twitter-clone-pearl-two.vercel.app

---

## Prerequisites

### 1. GitHub Account
- Repository: https://github.com/jian-ghost-shell/twitter-clone

### 2. Database (Neon PostgreSQL)
- Already set up with connection string in Vercel environment variables

### 3. Environment Variables
Required:
- `DATABASE_URL` - PostgreSQL connection string from Neon
- `NEXTAUTH_SECRET` - Random secret key

---

## Quick Deploy (If You Have Changes)

```bash
cd projects/twitter-clone
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will automatically deploy on push.

---

## Full Deployment Steps

### Step 1: Push Code to GitHub
```bash
cd projects/twitter-clone
git add .
git commit -m "Twitter Clone"
git remote add origin https://github.com/jian-ghost-shell/twitter-clone.git
git push -u origin main
```

### Step 2: Set Up Neon Database (if new)
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create project: "twitter-clone"
4. Copy connection string

### Step 3: Deploy to Vercel
1. Go to https://vercel.com
2. Import GitHub repository
3. Add Environment Variables:
   - `DATABASE_URL` = Neon connection string
   - `NEXTAUTH_SECRET` = generate with `openssl rand -base64 32`
4. Deploy!

### Step 4: Push Database Schema
```bash
DATABASE_URL="postgresql://..." npx prisma db push
```

---

## Important Notes

### Image Storage
- Vercel has read-only filesystem
- Images stored as base64 in database (2MB limit)
- For production: use S3 or Cloudinary

### Dark Mode
- Automatically follows system preference
- Uses CSS variables with `@media (prefers-color-scheme: dark)`

### Authentication
- Credentials provider (email + any password)
- User auto-created on first login

---

## Troubleshooting

### Build Fails
- Check environment variables are set in Vercel
- Ensure `postinstall` script runs `prisma generate`

### Database Connection Error
- Verify DATABASE_URL is correct
- Ensure Neon allows connections from Vercel IPs

### Images Not Showing
- Base64 stored in database
- If too large (>2MB), will be rejected

---

## Future Deployment Improvements

- [ ] Add S3/Cloudinary for image storage
- [ ] Add Google/GitHub OAuth
- [ ] Set up CI/CD pipeline
