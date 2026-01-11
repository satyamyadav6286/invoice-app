# 📊 Invoice Management System

![GitHub](https://img.shields.io/github/license/satyamyadav6286/invoice-app?color=blue)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-success)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Firebase](https://img.shields.io/badge/Firebase-10.13.0-orange)

## 🚀 [Live Demo](https://invoice-app-silk-ten.vercel.app/)

A modern, full-featured invoice management system built with React and Firebase. Create, manage, and track professional invoices with ease. Perfect for freelancers, small businesses, and entrepreneurs.

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Secure User Authentication**: Email/password authentication powered by Firebase Auth
- **User Registration**: Create accounts with profile picture upload
- **Session Management**: Persistent login sessions with secure logout
- **Protected Routes**: Dashboard and invoice pages require authentication

### 📝 Invoice Management
- **Create Invoices**: Build professional invoices with customer details, products, and pricing
- **Edit Invoices**: Update existing invoices with full editing capabilities
- **View Invoice Details**: Detailed invoice view with all information
- **Delete Invoices**: Remove invoices with confirmation dialogs
- **Invoice Numbering**: Automatic invoice number generation (INV-0001, INV-0002, etc.)
- **Invoice Status Tracking**: Track invoices as Draft, Sent, Paid, or Overdue
- **Due Date Management**: Set and track payment due dates
- **PDF Export**: Download invoices as professional PDF documents

### 💰 Financial Features
- **Tax Calculation**: Apply tax rates (percentage-based) to invoices
- **Discount System**: Apply percentage or fixed amount discounts
- **Subtotal Calculation**: Automatic calculation of line items
- **Total Calculation**: Accurate totals including tax and discounts
- **Multiple Products**: Add multiple line items to each invoice
- **Price & Quantity**: Set individual prices and quantities for products

### 👥 Client Management
- **Add Clients**: Store client information (name, email, phone, address, tax ID)
- **Edit Clients**: Update client details as needed
- **Delete Clients**: Remove clients from your database
- **Client Search**: Quickly find clients using search functionality
- **Client Listing**: View all clients in an organized list

### 📊 Dashboard & Analytics
- **Statistics Overview**: View total revenue, invoice count, monthly collections, pending amounts
- **Revenue Charts**: Visual representation of monthly revenue trends using Chart.js
- **Recent Invoices**: Quick access to your latest invoices
- **Overdue Tracking**: Monitor overdue invoices and amounts
- **Status Overview**: See counts for different invoice statuses

### 🔍 Search & Filter
- **Search Invoices**: Search by invoice number, customer name, or amount
- **Status Filtering**: Filter invoices by status (All, Draft, Sent, Paid, Overdue)
- **Sort Options**: Sort invoices by date (newest/oldest) or amount (high/low)
- **Client Search**: Search through client database

### ⚙️ Settings & Customization
- **Company Profile**: Manage company name, logo, address, contact information
- **Invoice Settings**: 
  - Custom invoice prefix
  - Default tax rate
  - Default payment terms
  - Invoice notes/templates
- **Profile Management**: Update display name and profile picture
- **User Preferences**: Store and manage user-specific settings

### 📱 User Experience
- **Responsive Design**: Fully responsive layout for desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with smooth animations
- **Toast Notifications**: User-friendly notifications for all actions
- **Loading States**: Visual feedback during data operations
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Form Validation**: Input validation for all forms

---

## 🛠️ Technologies Used

### Frontend
- **React.js** (v18.3.1) - UI library
- **React Router** (v6.26.1) - Navigation and routing
- **CSS3** - Styling and responsive design
- **Font Awesome** - Icons and visual elements

### Backend & Services
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - NoSQL database for invoices and clients
- **Firebase Storage** - Profile picture and logo storage

### Libraries & Tools
- **jsPDF** (v2.5.1) - PDF generation
- **html2canvas** (v1.4.1) - HTML to canvas conversion for PDF
- **Chart.js** (v4.4.4) - Data visualization and charts
- **date-fns** (v4.1.0) - Date formatting and manipulation
- **react-toastify** (v11.0.5) - Toast notifications
- **react-icons** (v5.5.0) - Icon library

### Deployment
- **Vercel** - Hosting and deployment platform

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control
- **Firebase Account** - For backend services ([Sign up here](https://firebase.google.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/satyamyadav6286/invoice-app.git
   cd invoice-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Create a Firestore database
   - Enable Storage
   - Copy your Firebase configuration
   - Update `src/firebase.js` with your Firebase config:
     ```javascript
     const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
     };
     ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - The app will automatically reload when you make changes

---

## 📋 Available Scripts

- **`npm start`** - Runs the app in development mode at `http://localhost:3000`
- **`npm test`** - Launches the test runner in interactive watch mode
- **`npm run build`** - Builds the app for production to the `build` folder
- **`npm run eject`** - Ejects from Create React App (one-way operation, not recommended)

---

## 📁 Project Structure

```
invoice-app/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── component/
│   │   ├── dashboard/
│   │   │   ├── Dashboard.js          # Main dashboard layout
│   │   │   ├── Home.js               # Dashboard home with stats
│   │   │   ├── Invoices.js           # Invoice listing page
│   │   │   ├── NewInvoice.js         # Create new invoice
│   │   │   ├── EditInvoice.js        # Edit existing invoice
│   │   │   ├── Clients.js            # Client management
│   │   │   └── Setting.js            # Settings page
│   │   ├── login/
│   │   │   └── Login.js              # Login page
│   │   ├── register/
│   │   │   └── Register.js           # Registration page
│   │   ├── InvoiceDetail.js          # Invoice detail view
│   │   └── Footer.js                 # Footer component
│   ├── App.js                        # Main app component with routing
│   ├── firebase.js                   # Firebase configuration
│   ├── index.js                      # Entry point
│   └── index.css                     # Global styles
├── package.json
└── README.md
```

---

## 🔄 Usage Guide

### 1. Getting Started
- **Register**: Create a new account with your email and password
- **Login**: Sign in with your credentials
- **Dashboard**: Access the main dashboard with overview statistics

### 2. Creating Invoices
- Navigate to "New Invoice" from the sidebar
- Fill in customer details (name, email, phone, address)
- Add products with name, price, and quantity
- Set invoice date and due date
- Choose invoice status (Draft, Sent, Paid)
- Apply tax rate and discounts if needed
- Add notes (optional)
- Click "Save Invoice" to create

### 3. Managing Invoices
- View all invoices in the "Invoices" page
- Search for specific invoices
- Filter by status
- Sort by date or amount
- Click on an invoice to view details
- Edit or delete invoices as needed
- Download invoices as PDF

### 4. Client Management
- Go to "Clients" page
- Add new clients with their information
- Edit existing client details
- Search for clients
- Delete clients when needed

### 5. Settings
- Update company information
- Upload company logo
- Set default invoice settings (tax rate, payment terms, prefix)
- Manage profile information

---

## 🎨 Features in Detail

### Invoice Status Types
- **Draft**: Invoices that are still being prepared
- **Sent**: Invoices that have been sent to clients
- **Paid**: Invoices that have been paid
- **Overdue**: Invoices past their due date

### Invoice Numbering
- Automatic sequential numbering (INV-0001, INV-0002, etc.)
- Customizable prefix in settings
- Unique per user

### PDF Generation
- Professional PDF layout
- Includes all invoice details
- Company logo and information
- Customer details
- Itemized product list
- Tax and discount breakdown
- Total amount

### Dashboard Statistics
- Total Revenue: Sum of all paid invoices
- Total Invoices: Count of all invoices
- Monthly Collection: Revenue for current month
- Pending Amount: Sum of unpaid invoices
- Overdue Count: Number of overdue invoices

---

## 🔒 Security Features

- **Firebase Authentication**: Secure user authentication
- **Firestore Security Rules**: Database security (configure in Firebase Console)
- **User Data Isolation**: Each user can only access their own data
- **Protected Routes**: Authentication required for dashboard access
- **Secure Storage**: Profile pictures and files stored securely

---

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 📝 Firebase Setup Instructions

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name and follow the setup wizard

2. **Enable Authentication**
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"

3. **Create Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Start in test mode (update rules for production)
   - Choose a location

4. **Enable Storage**
   - Go to Storage
   - Click "Get started"
   - Start in test mode (update rules for production)

5. **Get Configuration**
   - Go to Project Settings → General
   - Scroll to "Your apps"
   - Click the web icon (</>)
   - Copy the configuration object

6. **Update Security Rules** (Important for production)
   - Set up proper Firestore security rules
   - Set up Storage security rules
   - Ensure users can only access their own data

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 Author

**Satyam Govind Yadav**

- GitHub: [@satyamyadav6286](https://github.com/satyamyadav6286)
- Project Link: [https://github.com/satyamyadav6286/invoice-app](https://github.com/satyamyadav6286/invoice-app)

---

## 🙏 Acknowledgments

- Firebase for backend services
- React team for the amazing framework
- All open-source libraries used in this project
- The developer community for inspiration and support

---

## ⭐ Show Your Support

If you found this project helpful, please consider giving it a star on GitHub!

---

## 📧 Support

For support, email satyamgovindyadav@gmail.com or open an issue on GitHub.

---

**Made with ❤️ by Satyam Govind Yadav**
