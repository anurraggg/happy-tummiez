# Complete Deployment Guide - Frontend + Backend

## 🎯 Overview
We'll deploy:
1. **Frontend** → Vercel (free, instant)
2. **Backend** → Railway (free tier)

---

## 📦 PART 1: Deploy Frontend to Vercel

### Step 1: Login to Vercel
```bash
vercel login
```
- A browser window will open
- Click "Continue with GitHub" (or email)
- Authorize Vercel

### Step 2: Deploy
```bash
vercel
```

You'll be asked:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → happy-tummiez (or press Enter)
- **Directory?** → ./ (press Enter)
- **Override settings?** → No

Wait ~30 seconds... Done! ✅

### Step 3: Deploy to Production
```bash
vercel --prod
```

Your site will be live at: `https://happy-tummiez.vercel.app`

---

## 🔧 PART 2: Deploy Backend to Railway

### Option A: Via Railway Dashboard (Easiest)

1. **Go to [railway.app](https://railway.app/)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose `anurraggg/happy-tummiez`**
6. **Configure**:
   - Root Directory: `/` (leave as is)
   - Build Command: (leave empty)
   - Start Command: `node server.cjs`
7. **Add Environment Variables**:
   - Click "Variables" tab
   - Add: `PORT` = `3000`
8. **Click "Deploy"**

### Option B: Via Railway CLI

1. **Install Railway CLI**:
```bash
npm install -g @railway/cli
```

2. **Login**:
```bash
railway login
```

3. **Initialize**:
```bash
railway init
```

4. **Deploy**:
```bash
railway up
```

5. **Get URL**:
```bash
railway domain
```

---

## 🔗 PART 3: Connect Frontend to Backend

### Step 1: Get Your Backend URL
After Railway deployment, you'll get a URL like:
`https://happy-tummiez-production.up.railway.app`

### Step 2: Update Frontend Code
Open `src/auth.js` and update:

```javascript
const API_URL = 'https://your-railway-url.up.railway.app/api';
```

### Step 3: Enable CORS on Backend
Open `server.cjs` and update CORS:

```javascript
app.use(cors({
  origin: 'https://happy-tummiez.vercel.app',
  credentials: true
}));
```

### Step 4: Redeploy Frontend
```bash
git add .
git commit -m "Update API URL for production"
git push
vercel --prod
```

---

## ✅ PART 4: Verification Checklist

### Frontend (Vercel)
- [ ] Site loads at your Vercel URL
- [ ] All pages work (Home, DQ Test, Games)
- [ ] Responsive on mobile
- [ ] Google Analytics tracking works
- [ ] Images load correctly

### Backend (Railway)
- [ ] Backend is running (check Railway logs)
- [ ] Database file created
- [ ] API endpoints respond

### Integration
- [ ] Can sign up new user
- [ ] Can login
- [ ] Can logout
- [ ] User state persists

---

## 🐛 Troubleshooting

### Frontend Issues
**Problem**: Images not loading
**Solution**: Check that images are in `/public` folder

**Problem**: 404 on refresh
**Solution**: Already fixed with `vercel.json`

### Backend Issues
**Problem**: CORS errors
**Solution**: Update CORS origin in `server.cjs`

**Problem**: Database not persisting
**Solution**: Railway provides persistent storage automatically

### Integration Issues
**Problem**: Login fails
**Solution**: 
1. Check API_URL is correct
2. Check CORS is configured
3. Check Railway logs for errors

---

## 📊 Post-Deployment

### Update Google Analytics
The analytics will automatically start tracking your live site!

### Update Meta Tags
In `index.html`, replace:
```html
<meta property="og:url" content="https://your-actual-url.vercel.app/" />
```

### Set Up Custom Domain (Optional)
1. Buy domain (Namecheap, GoDaddy)
2. In Vercel: Settings → Domains → Add
3. Update DNS records as instructed

---

## 💰 Cost Breakdown

### Free Tier Limits:
- **Vercel**: 100GB bandwidth/month, unlimited sites
- **Railway**: $5 credit/month (enough for small apps)

Both are FREE for your use case! 🎉

---

## 🎉 You're Done!

Your website will be live at:
- Frontend: `https://happy-tummiez.vercel.app`
- Backend: `https://your-app.up.railway.app`

Share your link with the world! 🌍
