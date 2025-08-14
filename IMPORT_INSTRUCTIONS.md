# 📊 Data Import System - Starweaver Productivity App

## 🚀 Overview

The Data Import System allows Super Admins to bulk import team structure and productivity data into the Starweaver application. This system automatically creates user accounts, sets up team relationships, and imports historical productivity data.

## ✨ Features

- **Bulk User Creation**: Create multiple Team Leaders and Editors at once
- **Team Management**: Automatically assign users to teams
- **Productivity Data Import**: Import historical video completion data
- **Data Validation**: Comprehensive validation before import
- **Preview & Confirm**: Review data before final import
- **Error Handling**: Detailed error reporting for failed imports

## 🔐 User Account Creation

### Team Leaders (Managers)
- **Role**: `manager`
- **Password**: `Admin@124`
- **Access**: Can view and manage their team's data
- **Email Format**: `firstname@gmail.com` (e.g., `sachinkumar@gmail.com`)

### Editors
- **Role**: `editor`
- **Password**: `Editor@123`
- **Access**: Can log productivity entries and view personal dashboard
- **Email Format**: `firstname@gmail.com` (e.g., `aman@gmail.com`)

## 📁 Expected Data Format

Your import file should be a JSON file with the following structure:

```json
{
  "teamLeaders": [
    {
      "firstName": "Sachin",
      "lastName": "Kumar",
      "email": "sachinkumar@gmail.com",
      "teamName": "Team Alpha"
    }
  ],
  "editors": [
    {
      "firstName": "Aman",
      "lastName": "Singh",
      "email": "aman@gmail.com",
      "teamLeader": "Sachin Kumar",
      "teamName": "Team Alpha"
    }
  ],
  "productivityData": [
    {
      "date": "2024-01-15",
      "editorName": "Aman Singh",
      "videosCompleted": 8,
      "category": "Course",
      "notes": "Completed 8 course videos today",
      "mood": 4,
      "energyLevel": 4,
      "challenges": "Some technical difficulties",
      "achievements": "Improved editing speed by 15%"
    }
  ]
}
```

## 📋 Required Fields

### Team Leaders
- `firstName`: First name of the team leader
- `lastName`: Last name of the team leader
- `email`: Email address (must be unique)
- `teamName`: Name of the team they will manage

### Editors
- `firstName`: First name of the editor
- `lastName`: Last name of the editor
- `email`: Email address (must be unique)
- `teamLeader`: Full name of the team leader they report to
- `teamName`: Name of the team they belong to

### Productivity Data
- `date`: Date in YYYY-MM-DD format
- `editorName`: Full name of the editor (must match an editor in the editors array)
- `videosCompleted`: Number of videos completed (0 for leave days)
- `category`: Must be one of: "Course", "Marketing", "Leave"
- `notes`: Optional notes about the day
- `mood`: Optional mood rating (1-5, where 5 is best)
- `energyLevel`: Optional energy level (1-5, where 5 is highest)
- `challenges`: Optional challenges faced
- `achievements`: Optional achievements for the day

## 🚀 How to Use

### 1. Prepare Your Data
- Convert your Excel/CSV data to the JSON format shown above
- Use the `sample-import-template.json` file as a reference
- Ensure all required fields are present and valid

### 2. Access the Import System
- Login as a Super Admin
- Go to the Admin Dashboard
- Click the **"Import Data"** button in the Quick Actions section

### 3. Upload and Validate
- Click **"Choose File"** and select your JSON file
- The system will validate your data and show any errors
- Fix any validation errors before proceeding

### 4. Preview Data
- Review the data preview showing:
  - Team Leaders to be created
  - Editors to be created
  - Productivity entries to be imported
- Confirm the data looks correct

### 5. Import
- Click **"Confirm Import"** to proceed
- The system will create users and import data
- You'll see a success message with import results

## ⚠️ Important Notes

### Data Validation
- All emails must be unique
- Team names must match between team leaders and editors
- Editor names in productivity data must match editor names in the editors array
- Dates must be in valid YYYY-MM-DD format

### Existing Data
- If a user with the same email already exists, they will be skipped
- If a productivity entry already exists for the same user and date, it will be skipped
- Teams are created automatically if they don't exist

### Password Security
- All new users will have the default passwords specified above
- Users should change their passwords on first login
- Consider implementing a password reset system for security

## 🔧 Troubleshooting

### Common Errors
1. **"Missing required fields"**: Check that all required fields are present
2. **"Invalid email format"**: Ensure emails contain @ symbol
3. **"Editor not found"**: Verify editor names in productivity data match editor names in editors array
4. **"Team not found"**: Ensure team names are consistent between team leaders and editors

### Import Failures
- Check the error messages in the console
- Verify your JSON format matches the expected structure
- Ensure all required fields are present and valid
- Check that editor names in productivity data exactly match editor names in the editors array

## 📊 Sample Data

Use the `sample-import-template.json` file as a starting point. This file contains:
- 3 Team Leaders with different teams
- 6 Editors assigned to different teams
- 5 sample productivity entries

## 🆘 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your data format matches the expected structure
3. Ensure all required fields are present
4. Check that team names and editor names are consistent

## 🔄 After Import

Once the import is complete:
1. **New users can login** with their default passwords
2. **Team Leaders can view** their team's data in the Manager Dashboard
3. **Editors can log** new productivity entries
4. **Productivity data** will appear in charts and reports
5. **Teams are automatically** set up with proper relationships

---

**Note**: This import system is designed for initial data setup. For ongoing data management, use the regular entry forms and team management features within the application.
