# 🏨 Hospitality Management System

A comprehensive hotel reservation and management system with real-time room availability checking.

## 📋 Project Overview

This system provides a complete solution for managing hotel reservations with a focus on real-time room availability checking. It includes user authentication, hotel and room registration, reservation lifecycle management, and automatic bill generation.

## ✨ Key Features

### Core Features
- **Real-time Room Availability Checking** - Instantly verify if rooms are available for specific dates
- **User Authentication** - Secure login system for hotel staff and administrators
- **Reservation Management** - Complete booking lifecycle (create, check-in, check-out, cancel)
- **Alternative Room Suggestions** - Automatically suggest available alternatives when selected room is unavailable
- **Bill Generation** - Automatic calculation and generation of guest bills

### User Interface
- **Modern Web Interface** - Clean, responsive design for easy navigation
- **Dashboard View** - Comprehensive overview of all reservations and hotel operations
- **Role-based Access** - Different permissions for Admin and Staff users
- **Real-time Feedback** - Instant availability status with visual indicators

## 🏗️ System Architecture

### Backend Components
- **Database**: SQL Server with relational schema
- **API Server**: Node.js with Express framework
- **Stored Procedures**: All business logic implemented in SQL

### Frontend Components
- **Web Application**: HTML5, CSS3, JavaScript (ES6+)
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Dynamic content loading without page refresh

## 📊 Database Schema

### Tables
- **Users**: System user authentication and roles
- **Hotels**: Hotel property information
- **Rooms**: Room details and pricing
- **Reservations**: Guest booking records
- **Bills**: Billing and payment information

### Key Stored Procedures
- `sp_CheckRoomAvailability` - Core availability checking logic
- `sp_GetAvailableRooms` - Find alternative room options
- `sp_CreateReservation` - Create new bookings
- `sp_CheckIn` / `sp_CheckOut` - Guest management
- `sp_GenerateBill` - Automatic bill calculation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- SQL Server (LocalDB, Express, or full version)
- Modern web browser

### Installation

1. **Clone or download the project**
   ```cmd
   cd d:\COLLEGE\SQL\OmkarShinde_SQL_Project
   ```

2. **Install dependencies**
   ```cmd
   npm install
   ```

3. **Set up the database**
   - Create a new database called `HospitalityDB`
   - Run the scripts in this order:
     ```sql
     -- 1. Create tables
     database/schema.sql
     
     -- 2. Create stored procedures
     database/stored_procedures.sql
     ```

4. **Configure database connection**
   - Edit `backend/database.js`
   - Update the connection settings:
     ```javascript
     const config = {
         user: 'your_username',
         password: 'your_password',
         server: 'localhost',
         database: 'HospitalityDB'
     };
     ```

5. **Start the application**
   ```cmd
   npm start
   ```

6. **Access the application**
   - Open your browser and go to: `http://localhost:3000`

### Demo Login Credentials
- **Administrator**: `admin` / `admin123`
- **Staff Member**: `staff1` / `staff123`

## 💻 Usage Guide

### For Hotel Staff

1. **Login** - Use your credentials to access the system
2. **Check Availability** - Enter dates and room details to check availability
3. **Create Reservations** - Book rooms for guests with complete details
4. **Manage Check-ins/Check-outs** - Process guest arrivals and departures
5. **View Dashboard** - Monitor all current and upcoming reservations

### For Administrators

All staff features plus:
- **Add Hotels** - Register new hotel properties
- **Add Rooms** - Create room inventory with pricing
- **Full System Access** - Complete management capabilities

### Key Workflows

#### Room Availability Check
1. Select hotel and room
2. Choose check-in and check-out dates
3. Click "Check Availability"
4. System displays availability status instantly
5. If unavailable, view alternative room suggestions

#### Creating a Reservation
1. Select hotel and available room
2. Enter guest information
3. Specify dates
4. System verifies availability before booking
5. Confirmation with reservation ID

#### Check-in/Check-out Process
1. Find reservation in dashboard
2. Click "Check In" when guest arrives
3. Click "Check Out" when guest departs
4. System automatically generates final bill

## 🔧 Technical Details

### API Endpoints
- `POST /api/login` - User authentication
- `GET /api/hotels` - Retrieve hotels and rooms
- `POST /api/check-availability` - Check room availability
- `POST /api/available-rooms` - Get alternative options
- `POST /api/reservations` - Create new reservation
- `GET /api/reservations` - View all reservations
- `POST /api/checkin/:id` - Check in guest
- `POST /api/checkout/:id` - Check out guest and generate bill

### Database Features
- **Foreign Key Constraints** - Ensures data integrity
- **Date Validation** - Prevents invalid booking dates
- **Unique Constraints** - No duplicate room numbers per hotel
- **Automated Calculations** - Bill totals computed automatically

### Security Features
- **Password Hashing** - SHA2_256 encryption for user passwords
- **Parameterized Queries** - Protection against SQL injection
- **Role-based Access** - Different permissions for Admin vs Staff
- **Input Validation** - Client and server-side validation

## 🧪 Testing Scenarios

### Core Functionality Tests
1. **Double Booking Prevention** - Try to book the same room for overlapping dates
2. **Availability Accuracy** - Verify dates show correct availability status
3. **Bill Calculation** - Confirm nightly rate × number of nights = total
4. **Alternative Suggestions** - Check that alternatives exclude unavailable rooms
5. **Status Updates** - Verify reservation status changes correctly

### User Interface Tests
1. **Responsive Design** - Test on different screen sizes
2. **Form Validation** - Ensure required fields are validated
3. **Date Logic** - Check-out date must be after check-in date
4. **Real-time Updates** - Verify instant availability feedback

## 📁 Project Structure

```
OmkarShinde_SQL_Project/
├── backend/
│   ├── server.js          # Express API server
│   └── database.js        # Database connection configuration
├── database/
│   ├── schema.sql         # Database tables and sample data
│   └── stored_procedures.sql # All business logic procedures
├── frontend/
│   ├── index.html         # Main application interface
│   ├── styles.css         # Modern styling and responsive design
│   └── script.js          # Frontend logic and API integration
├── .github/
│   └── copilot-instructions.md # Development guidelines
├── package.json           # Node.js dependencies and scripts
└── README.md             # This documentation file
```

## 🎯 Project Goals Achieved

✅ **Real-time Availability Checking** - Core feature implemented with instant feedback  
✅ **User Authentication** - Secure login system with role-based access  
✅ **Complete Reservation Lifecycle** - From booking to check-out with bill generation  
✅ **Alternative Room Suggestions** - Smart recommendations when rooms unavailable  
✅ **Modern User Interface** - Clean, intuitive design for hotel staff  
✅ **Robust Database Design** - Proper relationships and business logic  
✅ **Professional Code Quality** - Well-structured, documented, and maintainable  

## 🔮 Future Enhancements

- Payment processing integration
- Email notifications for reservations
- Advanced reporting and analytics
- Mobile app development
- Integration with hotel booking platforms
- Multi-language support

## 👨‍💻 Developer Information

**Project**: Hospitality Management System  
**Developer**: Omkar Shinde  
**Technology Stack**: Node.js, Express, SQL Server, HTML5, CSS3, JavaScript  
**Key Focus**: Real-time room availability checking and reservation management  

This project demonstrates proficiency in full-stack development, database design, and creating practical business solutions for the hospitality industry.
