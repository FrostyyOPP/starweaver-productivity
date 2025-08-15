#!/bin/bash

echo "🚀 Importing Sachin Kumar's team members..."
echo "📋 Team members to import:"
echo "   1. Ashu Kumar (ashu.kumar@starweaver.com) - editor"
echo "   2. Prashansha Manral (prashansha.manral@starweaver.com) - editor"
echo "   3. Astha Sisodia (astha.sisodia@starweaver.com) - editor"
echo "   4. Kavita Singh (kavita.singh@starweaver.com) - editor"
echo "   5. Anshika Sahu (anshika.sahu@starweaver.com) - editor"
echo "   6. Akshay Jaiswal (akshay.jasiwal@starweaver.com) - editor"
echo "   7. Aman Katiya (aman.katiyar@starweaver.com) - editor"
echo ""
echo "🔑 All users will have password: Editor@123"
echo ""

# Import the team members
curl -X POST http://localhost:3000/api/import/users \
  -H "Content-Type: application/json" \
  -d @sachin-team-import.json

echo ""
echo "✅ Import completed!"
echo "📊 Check the response above for results."
