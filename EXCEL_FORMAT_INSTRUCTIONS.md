# 📊 Excel File Format Instructions - Starweaver Import System

## 🚀 Overview

The Starweaver import system now supports Excel files (.xlsx, .xls) and CSV files directly! No need to convert to JSON format. Simply prepare your data in Excel and upload it directly.

## 📁 Supported File Formats

- **Excel (.xlsx)** - Recommended
- **Excel (.xls)** - Legacy format
- **CSV (.csv)** - Comma-separated values
- **JSON (.json)** - Still supported for advanced users

## 🔐 User Import Excel Format

### Required Columns
Your Excel file must have these exact column headers (case-insensitive):

| Name | Email | Password | Role |
|------|-------|----------|------|
| Sachin Kumar | sachinkumar@gmail.com | Admin@124 | manager |
| Aman Singh | aman@gmail.com | Editor@123 | editor |
| Priya Sharma | priyasharma@gmail.com | Admin@124 | manager |

### Column Details
- **Name**: Full name of the user
- **Email**: Email address (must be unique)
- **Password**: Password (minimum 8 characters)
- **Role**: Must be one of: admin, manager, editor, viewer

### Excel Tips
1. **First row must be headers**
2. **Column names are flexible** - the system will find columns containing these keywords:
   - Name: "Name", "Full Name", "User Name"
   - Email: "Email", "Email Address", "User Email"
   - Password: "Password", "User Password"
   - Role: "Role", "User Role", "Access Level"

## 📊 Data Import Excel Format

### Required Columns
Your Excel file must have these exact column headers (case-insensitive):

| User Email | Date | Videos Completed | Category | Notes |
|------------|------|------------------|----------|-------|
| aman@gmail.com | 2024-01-15 | 8 | Course Video | Completed 8 course videos today |
| neha@gmail.com | 2024-01-15 | 12 | Marketing Video | High productivity day |
| anjali@gmail.com | 2024-01-16 | 0 | Leave | On leave today |

### Column Details
- **User Email**: Email of existing user (must match database)
- **Date**: Date in YYYY-MM-DD format
- **Videos Completed**: Number of videos completed (0 for leave days)
- **Category**: Type of video (Course Video, Marketing Video, or Leave)
- **Notes**: Optional notes about the day

### Excel Tips
1. **First row must be headers**
2. **Column names are flexible** - the system will find columns containing these keywords:
   - User Email: "Email", "User Email", "UserEmail"
   - Date: "Date", "Entry Date", "Work Date"
   - Videos Completed: "Videos", "Number of Videos", "Videos Completed"
   - Category: "Category", "Video Category", "Type", "Video Type"
   - Notes: "Notes", "Remarks", "Comments", "Description"

## 📋 Excel File Preparation Steps

### 1. Create Your Excel File
- Open Excel or Google Sheets
- Create a new spreadsheet

### 2. Add Headers
- **Row 1**: Add your column headers
- Make sure headers are descriptive and clear

### 3. Add Data
- **Row 2 onwards**: Add your actual data
- Ensure data matches the expected format

### 4. Save and Upload
- Save as .xlsx format (recommended)
- Upload directly to the import system

## ⚠️ Common Excel Mistakes to Avoid

### ❌ Don't Do This
- Leave the first row empty
- Use merged cells
- Have multiple sheets (only first sheet is read)
- Include empty rows between data
- Use complex formulas in data cells

### ✅ Do This Instead
- Start with headers in row 1
- Use single cells for each piece of data
- Keep data in one sheet
- Remove empty rows
- Use plain text/numbers for data

## 🔧 Excel Format Examples

### User Import Example
```
| Name          | Email                    | Password   | Role    |
|---------------|--------------------------|------------|---------|
| Sachin Kumar  | sachinkumar@gmail.com    | Admin@124  | manager |
| Aman Singh    | aman@gmail.com           | Editor@123 | editor  |
| Priya Sharma  | priyasharma@gmail.com    | Admin@124  | manager |
```

### Data Import Example
```
| User Email              | Date       | Videos | Category      | Notes                    |
|------------------------|------------|--------|---------------|--------------------------|
| aman@gmail.com         | 2024-01-15 | 8      | Course Video  | Completed 8 videos      |
| neha@gmail.com         | 2024-01-15 | 12     | Marketing     | Marketing content       |
| anjali@gmail.com       | 2024-01-16 | 0      | Leave         | On leave today          |
```

## 📊 Excel Template Files

For your convenience, you can download these Excel templates:

### User Import Template
- **File**: `user-import-template.xlsx`
- **Contains**: Sample user data with proper headers
- **Use**: As a starting point for your user import

### Data Import Template
- **File**: `data-import-template.xlsx`
- **Contains**: Sample productivity data with proper headers
- **Use**: As a starting point for your data import

## 🚀 How to Use Excel Import

### 1. Prepare Your Excel File
- Follow the format guidelines above
- Ensure all required columns are present
- Check that data is properly formatted

### 2. Upload to Import System
- Go to Admin Dashboard
- Click "Import Data"
- Choose import type (User or Data)
- Upload your Excel file

### 3. Review and Confirm
- System will parse your Excel file
- Preview the data before import
- Confirm import when ready

## 🔍 Troubleshooting Excel Import

### Common Issues

#### "Missing required columns"
- **Solution**: Check that your Excel file has the required headers
- **Tip**: Column names are case-insensitive and flexible

#### "Invalid data format"
- **Solution**: Ensure dates are in YYYY-MM-DD format
- **Tip**: Use Excel's date formatting for consistency

#### "Failed to parse Excel file"
- **Solution**: Check for merged cells or complex formatting
- **Tip**: Use simple, clean Excel format

### Excel Formatting Tips
1. **Dates**: Format as YYYY-MM-DD (e.g., 2024-01-15)
2. **Numbers**: Use plain numbers for video counts
3. **Text**: Avoid special characters in headers
4. **Empty Cells**: Remove completely empty rows

## 📈 Advanced Excel Features

### Data Validation
- Use Excel's data validation for dates
- Create dropdown lists for categories
- Set number ranges for video counts

### Conditional Formatting
- Highlight required fields
- Color-code different roles
- Mark invalid entries

### Formulas (Optional)
- Auto-calculate totals
- Date calculations
- Data consistency checks

---

**Note**: The Excel import system automatically detects column headers and maps them to the correct fields. Make sure your headers are descriptive and your data is clean for the best import experience.
