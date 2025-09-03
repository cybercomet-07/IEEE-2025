# CityPulse Deployment Guide

## 🚀 Deploy to Vercel (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Firebase project set up

### Step 1: Prepare Your Repository
1. Push your code to GitHub
2. Ensure all files are committed and pushed

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your CityPulse repository
5. Configure the following settings:

#### Build Settings
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Environment Variables
Add these environment variables in Vercel dashboard:

```
VITE_FIREBASE_API_KEY=AIzaSyBV9bRNn5a6czRsphdfuuwsptDJLOgaQ6M
VITE_FIREBASE_AUTH_DOMAIN=cityplus-main-f3457.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cityplus-main-f3457
VITE_FIREBASE_STORAGE_BUCKET=cityplus-main-f3457.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=1082811526433
VITE_FIREBASE_APP_ID=1:1082811526433:web:d8d74f1b07b90e340a2260
VITE_FIREBASE_MEASUREMENT_ID=G-Q7HFHNPMZH
VITE_GA_MEASUREMENT_ID=G-Q7HFHNPMZH
VITE_APP_NAME=CityPulse
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

### Step 3: Custom Domain Setup
1. In Vercel dashboard, go to your project
2. Click "Domains" tab
3. Add your custom domain (e.g., `citypulse.in`)
4. Follow DNS configuration instructions
5. Update Firebase Auth domain settings

### Step 4: Firebase Configuration
1. Go to Firebase Console
2. Navigate to Authentication > Settings > Authorized domains
3. Add your custom domain
4. Update Firebase project settings if needed

## 🔍 SEO & Google Discoverability

### Google Search Console Setup
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your property (website URL)
3. Verify ownership using HTML file or DNS
4. Submit your sitemap: `https://yourdomain.com/sitemap.xml`

### Google Analytics
- Already configured in `index.html`
- Measurement ID: `G-Q7HFHNPMZH`
- Track user behavior and engagement

### SEO Features Implemented
- ✅ Meta tags optimized for "civic issues", "municipal corporation", "smart city"
- ✅ Open Graph tags for social media sharing
- ✅ Structured data (JSON-LD) for better search results
- ✅ Sitemap.xml for search engine crawling
- ✅ Robots.txt for crawler guidance
- ✅ Mobile-responsive design
- ✅ Fast loading with Vite optimization

## 📱 PWA Features
- ✅ Service Worker for offline functionality
- ✅ Web App Manifest
- ✅ Installable on mobile devices
- ✅ Push notifications support

## 🎯 Target Keywords for Google Search
- "civic issues reporting"
- "municipal corporation complaints"
- "smart city platform India"
- "pothole reporting app"
- "street light complaints"
- "water problem reporting"
- "civic tech India"
- "citizen engagement platform"

## 📊 Performance Optimization
- Vite build optimization
- Code splitting
- Image optimization
- Lazy loading
- Service worker caching

## 🔧 Post-Deployment Checklist
- [ ] Test all authentication flows
- [ ] Verify Google sign-in works
- [ ] Check mobile responsiveness
- [ ] Test PWA installation
- [ ] Verify analytics tracking
- [ ] Submit sitemap to Google
- [ ] Test all major user flows
- [ ] Check console for errors

## 🚨 Troubleshooting

### Common Issues
1. **Google Sign-in not working**: Check Firebase Auth domain settings
2. **Build failures**: Ensure all dependencies are in package.json
3. **Environment variables**: Double-check Vercel environment settings
4. **Domain issues**: Verify DNS settings and SSL certificate

### Support
- Check Vercel deployment logs
- Monitor Firebase console for errors
- Use browser dev tools for debugging

## 📈 Monitoring & Analytics
- Google Analytics for user behavior
- Vercel Analytics for performance
- Firebase Analytics for app usage
- Google Search Console for SEO performance

---

**Ready to deploy?** Follow the steps above and your CityPulse app will be live and discoverable on Google! 🎉
