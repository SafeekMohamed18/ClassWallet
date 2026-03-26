# ClassWallet

A web-based financial and student management system designed for university classes. ClassWallet enables efficient tracking of student details, monthly fund collection, expenses, and financial reporting using a frontend-only architecture integrated with Google Sheets.

## Features

### Core Functionality
- **Student Management**: Add, edit, delete, and search student records
- **Fund Management**: Record income (student payments) and expenses
- **Dashboard**: Real-time financial overview with charts and key metrics
- **Reports**: Generate professional PDF reports with financial summaries
- **Authentication**: Secure Google Sign-In with role-based access

### User Roles
- **Admin (Treasurer)**: Full system access and management
- **Committee Members**: Fund transaction management and data viewing

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5
- **Charts**: Chart.js
- **Authentication**: Google Identity Services
- **Backend**: Google Apps Script (API Layer)
- **Database**: Google Sheets
- **PDF Generation**: jsPDF

## Project Structure

```
classWallet/
├── index.html              # Dashboard page
├── students.html           # Student management page
├── funds.html              # Fund management page
├── reports.html            # Reports and analytics page
├── assets/
│   ├── css/
│   │   └── style.css       # Custom styles
│   ├── images/
│   │   └── Logo.png        # Application Logo
│   └── js/
│       ├── auth.js         # Authentication management
│       ├── dashboard.js    # Dashboard functionality
│       ├── students.js     # Student management
│       ├── funds.js        # Fund management
│       └── reports.js      # Reports generation
└── README.md               # This file
```

## Setup Instructions

### 1. Prerequisites
- A Google account
- Google Sheets access
- Basic knowledge of Google Apps Script

### 2. Google Sheets Setup
1. Create a new Google Sheet
2. Create two sheets named:
   - `Students`
   - `Transactions`

3. Set up the column headers:

**Students Sheet:**
```
Reg No | Name | Mobile | Email | Address | Guardian Info | Birthday | Notes
```

**Transactions Sheet:**
```
ID | Type | Amount | Description | Student | Added By | Date
```

### 3. Google Apps Script Setup
1. Open your Google Sheet
2. Go to Extensions > Apps Script
3. Create a new script file and add the API code (see `google-apps-script-api.js` in the project)
4. Deploy the script as a web app
5. Copy the deployment URL

### 4. Frontend Configuration
1. Clone or download this repository
2. Open `assets/js/auth.js`
3. Replace `'YOUR_GOOGLE_CLIENT_ID'` with your actual Google OAuth client ID
4. Update the API endpoints in all JS files to point to your Apps Script URL

### 5. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Identity Services API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Copy the Client ID

## Usage

### First Time Setup
1. Open `index.html` in a web browser
2. Sign in with your Google account
3. The system will automatically check permissions

### Adding Students
1. Navigate to the Students page
2. Click "Add Student"
3. Fill in the required information
4. Click "Save Student"

### Recording Transactions
1. Go to the Funds page
2. Click "Add Income" or "Add Expense"
3. Fill in transaction details
4. Click "Save"

### Generating Reports
1. Visit the Reports page
2. Select report type and period
3. Click "Generate PDF Report"
4. Download the generated report

## API Integration

The system uses Google Apps Script as an API layer. The following endpoints are available:

- `GET /students` - Retrieve all students
- `POST /students` - Add new student
- `PUT /students/{id}` - Update student
- `DELETE /students/{id}` - Delete student
- `GET /transactions` - Retrieve all transactions
- `POST /transactions` - Add new transaction
- `DELETE /transactions/{id}` - Delete transaction

## Security Features

- Google OAuth 2.0 authentication
- Email-based access control
- Role-based permissions
- Secure API communication
- Data validation on both client and server

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Future Enhancements

- Mobile app (PWA)
- Multi-organization support
- Payment gateway integration
- Email notifications
- File upload for payment proofs
- Advanced analytics and forecasting
- Export to multiple formats
- Backup and restore functionality

---

**ClassWallet** - Making class financial management simple, transparent, and efficient.