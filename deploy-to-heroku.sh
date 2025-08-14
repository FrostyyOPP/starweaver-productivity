#!/bin/bash

echo "🚀 Deploying Starweaver Productivity App to Heroku..."
echo ""

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Installing now..."
    curl https://cli-assets.heroku.com/install.sh | sh
    echo "✅ Heroku CLI installed. Please restart your terminal and run this script again."
    exit 1
fi

echo "✅ Heroku CLI is ready"
echo ""

# Check if user is logged in
if ! heroku auth:whoami &> /dev/null; then
    echo "🔐 You need to login to Heroku first."
    echo "Please run: heroku login"
    echo "Then run this script again."
    exit 1
fi

echo "✅ Logged into Heroku as: $(heroku auth:whoami)"
echo ""

# Check if app exists
if [ -z "$HEROKU_APP_NAME" ]; then
    echo "📱 Creating new Heroku app..."
    echo "Enter your desired app name (or press Enter for auto-generated):"
    read app_name
    
    if [ -z "$app_name" ]; then
        heroku create
    else
        heroku create "$app_name"
    fi
    
    # Get the app name from the created app
    export HEROKU_APP_NAME=$(heroku apps:info --json | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Created app: $HEROKU_APP_NAME"
else
    echo "✅ Using existing app: $HEROKU_APP_NAME"
fi

echo ""
echo "🔧 Setting up environment variables..."

# Set MongoDB URI
echo "Enter your MongoDB connection string:"
read mongodb_uri
heroku config:set MONGODB_URI="$mongodb_uri"

# Set JWT Secret
echo "Enter your JWT secret key:"
read jwt_secret
heroku config:set JWT_SECRET="$jwt_secret"

# Set NODE_ENV
heroku config:set NODE_ENV="production"

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

# Deploy to Heroku
echo "🚀 Deploying to Heroku..."
git add .
git commit -m "🚀 Deploy to Heroku - $(date)"

if [ -z "$HEROKU_APP_NAME" ]; then
    git push heroku main
else
    git push heroku main:main
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment complete!"
    echo "Your app is now live on Heroku!"
    echo ""
    echo "📱 App URL: https://$HEROKU_APP_NAME.herokuapp.com"
    echo ""
    echo "📝 Next steps:"
    echo "1. Open your app: heroku open"
    echo "2. Check app status: heroku ps"
    echo "3. View logs: heroku logs --tail"
    echo "4. Test your live app"
    echo "5. Share the live link with others"
else
    echo "❌ Deployment failed. Check the logs with: heroku logs --tail"
    exit 1
fi
