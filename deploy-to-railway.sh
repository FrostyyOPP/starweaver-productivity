#!/bin/bash

echo "🚀 Deploying Starweaver Productivity App to Railway..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI is not installed. Installing now..."
    npm install -g @railway/cli
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Railway CLI. Please install manually:"
        echo "npm install -g @railway/cli"
        exit 1
    fi
fi

echo "✅ Railway CLI is ready"
echo ""

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 You need to login to Railway first."
    echo "Please run: railway login"
    echo "Then run this script again."
    exit 1
fi

echo "✅ Logged into Railway as: $(railway whoami)"
echo ""

# Check if project exists
if [ ! -f "railway.json" ]; then
    echo "📱 Initializing Railway project..."
    railway init
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to initialize Railway project. Please run manually:"
        echo "railway init"
        exit 1
    fi
fi

echo "✅ Railway project initialized"
echo ""

echo "🔧 Setting up environment variables..."
echo ""

# Set MongoDB URI
echo "Enter your MongoDB connection string:"
read mongodb_uri
railway variables set MONGODB_URI="$mongodb_uri"

# Set JWT Secret
echo "Enter your JWT secret key:"
read jwt_secret
railway variables set JWT_SECRET="$jwt_secret"

# Set NODE_ENV
railway variables set NODE_ENV="production"

echo "✅ Environment variables configured"
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

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment complete!"
    echo "Your app is now live on Railway!"
    echo ""
    
    # Get the live URL
    echo "📱 Getting your live URL..."
    live_url=$(railway domain)
    echo "✅ Live URL: $live_url"
    echo ""
    
    echo "📝 Next steps:"
    echo "1. Open your app: railway open"
    echo "2. Check deployment status: railway status"
    echo "3. View logs: railway logs"
    echo "4. Test your live app at: $live_url"
    echo "5. Share the live link with others"
else
    echo "❌ Deployment failed. Check the logs with: railway logs"
    exit 1
fi
