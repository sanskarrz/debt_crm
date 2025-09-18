# Frontend Deployment Guide

## Deploy to Vercel (Recommended)

### Prerequisites

- GitHub account
- Vercel account (free)

### Steps

1. **Push your code to GitHub** (frontend folder only or entire repo)

2. **Connect to Vercel:**

   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository

3. **Configure Build Settings:**

   - Framework Preset: **Next.js**
   - Root Directory: `frontend` (if using monorepo)
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Environment Variables:**
   Add in Vercel dashboard:

   ```
   NEXT_PUBLIC_API_URL=https://your-backend-app.render.com
   ```

5. **Deploy:**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Alternative: Deploy to Netlify

1. **Build Settings:**

   - Build command: `npm run build && npm run export`
   - Publish directory: `out`

2. **Update next.config.js** for static export:

   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     reactStrictMode: true,
     swcMinify: true,
     trailingSlash: true,
     output: "export",
     env: {
       NEXT_PUBLIC_API_URL:
         process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
     },
   };

   module.exports = nextConfig;
   ```

3. **Add export script to package.json:**
   ```json
   {
     "scripts": {
       "export": "next export"
     }
   }
   ```

## Environment Variables

### For Vercel:

- `NEXT_PUBLIC_API_URL`: Your backend API URL

### For Netlify:

- Same as Vercel

## Custom Domain (Optional)

1. In Vercel/Netlify dashboard, go to "Domains"
2. Add your custom domain
3. Update DNS records as instructed

## Automatic Deployments

Both Vercel and Netlify will automatically deploy when you push to your main branch.
