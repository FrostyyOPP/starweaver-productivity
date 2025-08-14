# 📊 Dual Import System - Starweaver Productivity App

## 🚀 Overview

The Dual Import System allows Super Admins to import data in two separate ways:

1. **User Import** - Bulk create users with their details, roles, and passwords
2. **Data Import** - Import productivity data for existing users

This system provides flexibility and better data management by separating user creation from productivity data import.

## ✨ Features

### User Import
- **Bulk User Creation**: Create multiple users at once
- **Role Assignment**: Set admin, manager, editor, or viewer roles
- **Password Management**: Secure password hashing
- **Validation**: Comprehensive validation before import

### Data Import
- **Productivity Data**: Import historical video completion data
- **User Mapping**: Link data to existing users via email
- **Duplicate Prevention**: Skip existing entries automatically
- **Data Validation**: Ensure data integrity

## 🔐 User Account Creation

### Supported Roles
- **admin**: Full system access
- **manager**: Team management and data viewing
- **editor**: Productivity entry creation and personal dashboard
- **viewer**: Read-only access to data

### Password Requirements
- Minimum 8 characters
- Automatically hashed for security
- Users should change passwords on first login

## 📁 Expected Data Formats

### 1. User Import Format

Your JSON file should contain:

```json
{
  "users": [
    {
      "name": "Sachin Kumar",
      "email": "sachinkumar@gmail.com",
      "password": "Admin@124",
      "role": "manager"
    }
  ]
}
```

**Required Fields:**
- `name`: Full name of the user
- `email`: Email address (must be unique)
- `password`: Password (minimum 8 characters)
- `role`: Must be admin, manager, editor, or viewer

### 2. Data Import Format

Your JSON file should contain:

```json
{
  "productivityData": [
    {
      "userEmail": "aman@gmail.com",
      "date": "2024-01-15",
      "videosCompleted": 8,
      "videoCategory": "Course Video",
      "notes": "Completed 8 course videos today"
    }
  ]
}
```

**Required Fields:**
- `userEmail`: Email of existing user (must match database)
- `date`: Date in YYYY-MM-DD format
- `videosCompleted`: Number of videos completed (0 for leave days)
- `videoCategory`: Type of video (Course Video, Marketing Video, or Leave)
- `notes`: Optional notes about the day

## 🚀 How to Use

### 1. Access the Import System
- Login as a Super Admin
- Go to the Admin Dashboard
- Click the **"Import Data"** button in the Quick Actions section

### 2. Choose Import Type
- **User Import**: For creating new user accounts
- **Data Import**: For importing productivity data

### 3. Prepare Your Data
- Convert your Excel/CSV data to the JSON format shown above
- Use the sample templates as references:
  - `sample-user-import.json` for user import
  - `sample-data-import.json` for data import

### 4. Upload and Validate
- Click **"Choose File"** and select your JSON file
- The system will validate your data and show any errors
- Fix any validation errors before proceeding

### 5. Preview Data
- Review the data preview showing what will be imported
- Confirm the data looks correct

### 6. Import
- Click **"Confirm Import"** to proceed
- The system will process your data and show results

## ⚠️ Important Notes

### User Import
- All emails must be unique
- Passwords must be at least 8 characters
- Roles must be valid (admin, manager, editor, viewer)
- Existing users with the same email will be skipped

### Data Import
- User emails must match existing users in the database
- Dates must be in valid YYYY-MM-DD format
- Videos completed cannot be negative
- Duplicate entries for the same user and date will be skipped

### Data Validation
- All required fields must be present
- Email formats must be valid
- Data types must match expectations

## 🔧 Troubleshooting

### Common Errors

#### User Import
1. **"Missing required fields"**: Check that all required fields are present
2. **"Invalid email format"**: Ensure emails contain @ symbol
3. **"Invalid role"**: Verify roles are admin, manager, editor, or viewer
4. **"Password too short"**: Ensure passwords are at least 8 characters

#### Data Import
1. **"User not found"**: Verify user emails exist in the database
2. **"Invalid date format"**: Use YYYY-MM-DD format
3. **"Negative videos"**: Videos completed cannot be negative
4. **"Invalid video category"**: Must be 'Course Video', 'Marketing Video', or 'Leave'
5. **"Entry already exists"**: Data for that user and date already exists

### Import Failures
- Check the error messages in the console
- Verify your JSON format matches the expected structure
- Ensure all required fields are present and valid
- For data import, verify all user emails exist in the database

## 📊 Sample Templates

### User Import Template
Use `sample-user-import.json` which contains:
- 3 Team Leaders (managers)
- 6 Editors
- Proper role assignments and passwords

### Data Import Template
Use `sample-data-import.json` which contains:
- 10 sample productivity entries
- Various user emails and dates
- Sample notes and video counts

## 🆘 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your data format matches the expected structure
3. Ensure all required fields are present
4. For data import, verify all user emails exist in the database
5. Check that dates are in the correct format

## 🔄 After Import

### User Import
- New users can login with their specified passwords
- Users should change passwords on first login
- Role-based access is immediately available

### Data Import
- Productivity data appears in charts and reports
- Data is linked to existing users
- Duplicate entries are automatically prevented

## 🔒 Security Considerations

- Passwords are automatically hashed using bcrypt
- Users should change default passwords
- Consider implementing password reset functionality
- Monitor user access and roles regularly

---

**Note**: This dual import system provides better data management by separating user creation from productivity data import. Import users first, then import productivity data for those users.
