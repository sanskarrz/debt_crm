# Backend Deployment Guide

## Deploy to Render (Recommended)

### Prerequisites

- GitHub account
- Render account (free tier available)

### Steps

1. **Push your code to GitHub**

2. **Create a new Web Service on Render:**

   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

3. **Configure Build Settings:**

   - Name: `debt-recovery-backend`
   - Environment: `Node`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `backend` (if using monorepo)
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`

4. **Environment Variables:**
   Add these in Render dashboard:

   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
   ```

5. **Add Database:**

   - In Render dashboard, click "New" → "PostgreSQL"
   - Name: `debt-recovery-db`
   - Plan: Free
   - Copy the connection string to `DATABASE_URL` in your web service

6. **Add Redis:**

   - Click "New" → "Redis"
   - Name: `debt-recovery-redis`
   - Plan: Free
   - Copy the connection string to `REDIS_URL` in your web service

7. **Initialize Database:**
   - Connect to your PostgreSQL instance
   - Run the SQL from `database/init.sql`

### Alternative: Deploy to Railway

1. **Connect Repository:**

   - Go to [railway.app](https://railway.app)
   - Click "Start a New Project"
   - Connect GitHub repository

2. **Configure Service:**

   - Select your backend folder
   - Railway auto-detects Node.js

3. **Add Database & Redis:**

   - Click "New" → "Database" → "PostgreSQL"
   - Click "New" → "Database" → "Redis"

4. **Environment Variables:**
   Railway auto-provides DATABASE_URL and REDIS_URL
   Add manually:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-secret-key
   ```

## Environment Variables Reference

### Required:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT tokens (min 32 characters)
- `NODE_ENV`: Set to "production"
- `PORT`: Port number (usually 3001)

### Optional:

- `FRONTEND_URL`: Your frontend URL for CORS
- `SMTP_*`: Email configuration for notifications

## Database Setup

### Initial Schema:

Run the SQL commands from `database/init.sql` in your PostgreSQL database.

### Migrations:

If you have TypeORM migrations, run:

```bash
npm run migration:run
```

## Custom Domain (Optional)

1. In Render/Railway dashboard, go to "Settings"
2. Add your custom domain
3. Update DNS records as instructed

## Monitoring & Logs

- Both Render and Railway provide built-in logging
- Check logs for any deployment issues
- Set up health checks if needed

## Scaling

- Free tiers have limitations
- Upgrade to paid plans for production workloads
- Consider load balancing for high traffic
