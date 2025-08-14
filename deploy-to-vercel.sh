#!/bin/bash

echo "🚀 Deploying Starweaver Productivity App to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 You need to login to Vercel first."
    echo "Please run: vercel login"
    echo "Then run this script again."
    exit 1
fi

echo "✅ Vercel CLI is ready"
echo ""

# Build the app
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod --yes

echo ""
echo "🎉 Deployment complete!"
echo "Your app should now be live on Vercel!"
echo ""
echo "📝 Next steps:"
echo "1. Set up environment variables in Vercel dashboard:"
echo "   - MONGODB_URI: Your MongoDB connection string"
echo "   - JWT_SECRET: Your JWT secret key"
echo "2. Test your live app"
echo "3. Share the live link with others"
