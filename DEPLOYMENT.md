# Deployment Guide - HappyTummy Website

## Quick Deploy to Vercel (Recommended - FREE)

Vercel is perfect for Vite projects and offers:
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from GitHub
- ✅ Custom domain support

### Option 1: Deploy via Vercel CLI (Fastest)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - Accept defaults for most questions
   - Your site will be live in ~30 seconds!

4. **For Production**:
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard (Easiest)

1. **Go to [vercel.com](https://vercel.com/)**
2. **Sign up/Login** with GitHub
3. **Click "Add New Project"**
4. **Import your GitHub repository** (`anurraggg/happy-tummiez`)
5. **Configure**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. **Click "Deploy"**

Your site will be live at: `https://your-project-name.vercel.app`

---

## Alternative: Deploy to Netlify (Also FREE)

### Via Netlify CLI

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

### Via Netlify Dashboard

1. Go to [netlify.com](https://netlify.com/)
2. Sign up with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy"

---

## Important: Backend Server Note

⚠️ **Your authentication backend (`server.cjs`) won't work on these free static hosts.**

You have two options:

### Option A: Deploy Backend Separately (Recommended)

Deploy your backend to a service like:
- **Railway** (free tier): [railway.app](https://railway.app/)
- **Render** (free tier): [render.com](https://render.com/)
- **Fly.io** (free tier): [fly.io](https://fly.io/)

Then update `src/auth.js` to use the deployed backend URL:
```javascript
const API_URL = 'https://your-backend.railway.app/api';
```

### Option B: Use Vercel Serverless Functions

Convert your Express backend to Vercel serverless functions:
1. Move `server.cjs` logic to `api/` folder
2. Each endpoint becomes a separate file
3. Use Vercel's built-in database options

---

## After Deployment

### 1. Update Google Analytics
- Get your Measurement ID from Google Analytics
- Update `src/analytics.js` with your real ID
- Redeploy

### 2. Update Backend URL (if using Option A)
- Deploy backend separately
- Update `API_URL` in `src/auth.js`
- Commit and push (auto-deploys if connected to GitHub)

### 3. Custom Domain (Optional)
- Buy a domain (e.g., from Namecheap, GoDaddy)
- In Vercel/Netlify dashboard, go to Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

## Deployment Checklist

- [ ] Push latest code to GitHub
- [ ] Deploy frontend to Vercel/Netlify
- [ ] Deploy backend to Railway/Render (if needed)
- [ ] Update `API_URL` in `src/auth.js`
- [ ] Add Google Analytics Measurement ID
- [ ] Test the live site
- [ ] Share the URL!

---

## Monitoring Your Site

Once deployed, you can:
- **Vercel Dashboard**: View deployment logs, analytics
- **Google Analytics**: Track real user traffic
- **Vercel Analytics** (optional paid): Advanced insights

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com/
- Railway Docs: https://docs.railway.app/
