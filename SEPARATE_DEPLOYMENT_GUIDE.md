# Separate Deployment Guide

## Overview

This guide shows how to deploy the frontend and backend separately instead of using Docker.

## Deployment Options

### Frontend Deployment Options:

1. **Vercel** (Recommended) - Free tier, automatic deployments
2. **Netlify** - Free tier, good for static sites
3. **Render** - Free tier available

### Backend Deployment Options:

1. **Render** (Recommended) - Free PostgreSQL, Redis available
2. **Railway** - Good for databases, pay-as-you-go
3. **Heroku** - Paid plans only now
4. **DigitalOcean App Platform** - Simple deployment

## Folder Structure for Separate Deployments

### Option 1: Keep Current Monorepo Structure

```
debt-recovery-crm/
├── frontend/          # Deploy this folder to Vercel
├── backend/           # Deploy this folder to Render
├── dialer/           # Deploy this folder separately if needed
└── database/         # SQL scripts for database setup
```

### Option 2: Split into Separate Repositories

```
debt-recovery-frontend/     # Separate repo for Vercel
├── package.json
├── next.config.js
├── pages/
├── styles/
└── ...

debt-recovery-backend/      # Separate repo for Render
├── package.json
├── src/
├── dist/
└── ...
```

## Environment Variables Setup

### Frontend (.env.local for Vercel)

```
NEXT_PUBLIC_API_URL=https://your-backend-app.render.com
```

### Backend (.env for Render)

```
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://user:pass@host:port
JWT_SECRET=your-jwt-secret
PORT=3001
NODE_ENV=production
```

## Next Steps

Choose your preferred deployment method and follow the specific guides below.
