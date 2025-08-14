# 🚀 Starweaver Productivity App - Deployment Guide

## 📋 **Deployment Options**

### **Option 1: Vercel (Recommended for Full-Stack Next.js)**

Vercel is the best choice for Next.js applications as it provides:
- ✅ Full Next.js support (API routes, middleware, etc.)
- ✅ Automatic deployments from GitHub
- ✅ Built-in analytics and monitoring
- ✅ Global CDN
- ✅ Serverless functions support

#### **Step 1: Create Vercel Account**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with your GitHub account
3. Import your repository: `FrostyyOPP/starweaver-productivity`

#### **Step 2: Get Required Values**
After importing, you'll need these values:
- **VERCEL_TOKEN**: Personal access token from Vercel dashboard
- **ORG_ID**: Organization ID from Vercel dashboard  
- **PROJECT_ID**: Project ID from Vercel dashboard

#### **Step 3: Add GitHub Secrets**
1. Go to: `https://github.com/FrostyyOPP/starweaver-productivity/settings/secrets/actions`
2. Add these repository secrets:
   - `VERCEL_TOKEN`
   - `ORG_ID`
   - `PROJECT_ID`

#### **Step 4: Automatic Deployment**
- Push to `main` branch triggers automatic deployment
- Pull requests create preview deployments
- Check deployment status in GitHub Actions tab

---

### **Option 2: Firebase Hosting (Static Frontend Only)**

Firebase is good for static sites but limited for full-stack apps:
- ⚠️ No API route support
- ⚠️ No server-side functionality
- ✅ Fast static hosting
- ✅ Good for frontend-only apps

#### **Step 1: Firebase Setup**
```bash
# Already configured in this project
firebase login
firebase init hosting
```

#### **Step 2: Deploy**
```bash
npm run build
firebase deploy
```

---

## 🔧 **Environment Variables**

### **Required for Production**
Create a `.env.production` file or add to Vercel dashboard:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Next.js
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret
```

---

## 📱 **Current Status**

- ✅ **Build**: Application builds successfully
- ✅ **GitHub Actions**: Vercel workflow configured
- ✅ **Firebase**: Configuration ready
- ⏳ **Deployment**: Waiting for Vercel setup

---

## 🚨 **Important Notes**

1. **Backend Requirements**: This app requires a running MongoDB instance
2. **API Routes**: All authentication and data endpoints need the backend
3. **Environment**: Set up production environment variables
4. **Database**: Ensure MongoDB is accessible from Vercel's servers

---

## 🔍 **Troubleshooting**

### **Build Issues**
- Check Node.js version (18+ recommended)
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### **Deployment Issues**
- Verify GitHub secrets are correct
- Check Vercel project settings
- Review GitHub Actions logs

---

## 📞 **Support**

If you encounter issues:
1. Check GitHub Actions logs
2. Review Vercel deployment logs
3. Verify environment variables
4. Test locally with `npm run dev`

---

**Happy Deploying! 🎉**
