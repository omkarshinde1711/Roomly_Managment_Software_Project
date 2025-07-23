# Roomly Management Software Project

<div align="center">
  <img src="frontend/assets/logo.png" alt="Roomly Logo" width="100"/>
</div>

SQL-focused hotel management system demonstrating comprehensive database design, stored procedures, and real-time availability checking.


## SnapShot

<img width="1833" height="2349" alt="Roomly Dashboard" src="https://github.com/user-attachments/assets/906b3d7e-7447-408f-9dd1-ddfd7cdae0b3" />


## Video Demonstration

[![Roomly Management System Demo](https://img.shields.io/badge/Watch-Demo%20Video-red?style=for-the-badge&logo=youtube)](URL_TO_YOUR_VIDEO)

## Technology Stack

**Database**: MySQL with comprehensive stored procedures  
**Backend**: Node.js with Express API  
**Frontend**: HTML5, CSS3, JavaScript  
**Architecture**: Full-stack web application with SQL-first approach

## Database Implementation

### Core Tables
```sql
Users           - Authentication and role management
Hotels          - Property information
Rooms           - Room inventory with rates
Reservations    - Booking lifecycle management
Bills           - Automated billing system
```

### Key Stored Procedures
```sql
sp_CheckRoomAvailability    - Real-time availability checking
sp_GetAvailableRooms       - Alternative room suggestions
sp_CreateReservation       - Reservation creation with validation
sp_CheckIn / sp_CheckOut   - Guest management workflow
sp_GenerateBill            - Automated bill calculation
sp_UserLogin               - Secure authentication
```

## Core Features

**Real-time Room Availability**: SQL-based conflict detection with date overlap logic  
**Complete Reservation Lifecycle**: Create → Check-in → Check-out → Bill Generation  
**Alternative Room Suggestions**: Smart recommendations when preferred rooms unavailable  
**Hotel Information Display**: Hotel names shown in all reservation cards for better context  
**Interactive Room Selection**: Click-to-select alternative rooms with detailed information  
**User Authentication**: Role-based access (Admin/Staff) with session management  
**Automated Billing**: Dynamic calculation based on stay duration and room rates

## SQL Highlights

### Availability Checking Logic
```sql
-- Core business logic for room availability
SELECT COUNT(*) INTO v_ConflictCount
FROM Reservations
WHERE RoomID = p_RoomID
AND Status IN ('Confirmed', 'CheckedIn')
AND (p_CheckInDate < CheckOutDate AND p_CheckOutDate > CheckInDate);
```

### Bill Generation
```sql
-- Automated billing calculation
SET v_TotalAmount = v_RatePerNight * v_NumberOfNights;
INSERT INTO Bills (ReservationID, TotalAmount, PaymentStatus)
VALUES (p_ReservationID, v_TotalAmount, 'Unpaid');
```

## Project Structure

```
database/
├── schema.sql              # Complete database schema
└── stored_procedures.sql   # 11 comprehensive stored procedures

backend/
├── server.js              # Express API with 12 endpoints
└── database.js           # MySQL connection management

frontend/
├── index.html            # Landing page with authentication
├── dashboard.html        # Main application interface
├── styles.css           # Professional styling
└── dashboard.js         # API integration and UI logic
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- MySQL Server
- MySQL Workbench (recommended)

### Database Setup
```sql
CREATE DATABASE HospitalityDB;
USE HospitalityDB;
-- Run database/schema.sql
-- Run database/stored_procedures.sql
```

### Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

### Application Start
```bash
npm install
npm start
# Access at http://localhost:3000
```

### Demo Credentials
```
Admin: admin / admin123
Staff: staff1 / staff123
```

## API Endpoints

```
POST /api/login                    - User authentication
GET  /api/hotels                   - Retrieve hotels with rooms
GET  /api/hotels/:id/rooms         - Get rooms by specific hotel
POST /api/rooms/availability       - Real-time availability check
POST /api/rooms/available          - Get alternative available rooms
POST /api/reservations             - Create new reservation
GET  /api/reservations             - Get all reservations with hotel details
POST /api/checkin/:id              - Guest check-in
POST /api/checkout/:id             - Check-out with billing
DELETE /api/reservations/:id       - Cancel reservation
GET  /api/bills/:reservationId     - Retrieve bill details
```

## Key SQL Features Implemented

**Parameterized Queries**: Protection against SQL injection  
**Foreign Key Constraints**: Data integrity enforcement  
**Date Validation**: Business rule implementation  
**Automated Calculations**: Server-side business logic  
**Transaction Management**: Consistent data operations  
**Stored Procedure Architecture**: All business logic in database layer

## Testing Scenarios

**Double Booking Prevention**: Overlapping date conflict detection  
**Availability Accuracy**: Real-time status verification with alternative suggestions  
**Bill Calculation**: Rate × nights validation  
**Alternative Room Display**: Available room recommendations with hotel context  
**Hotel Information**: Hotel names visible in all reservation displays  
**Interactive Selection**: Alternative room click-to-select functionality  
**Status Workflow**: Complete reservation lifecycle management

## Developer Information

**Project**: SQL-focused Hotel Management System  
**Author**: Omkar Shinde  
**Focus**: Database design, stored procedures, and business logic implementation  
**Completion**: 95% - Production ready

This project demonstrates advanced SQL database design, comprehensive stored procedure implementation, and real-world business logic handling in a hotel management context.

## User Interface Features

### Current Reservations Page
- **Hotel Names**: Each reservation card displays the associated hotel name for better context
- **Complete Details**: Room number, dates, rates, and total amount clearly displayed
- **Status Management**: Visual status badges with appropriate action buttons
- **Responsive Design**: Clean card layout adapts to different screen sizes

### Check Room Availability Page
- **Real-time Validation**: Instant availability checking with detailed feedback
- **Alternative Suggestions**: When rooms unavailable, displays grid of alternative options
- **Interactive Selection**: Click any alternative room card to automatically select it
- **Detailed Room Info**: Each alternative shows room type, rate, capacity, and hotel name
- **Smart Filtering**: Alternatives filtered by hotel and date availability

### Enhanced User Experience
- **Visual Feedback**: Color-coded availability results (green/red)
- **Hover Effects**: Interactive room cards with smooth transitions
- **Loading States**: Visual indicators during API calls
- **Error Handling**: Clear error messages with fallback options
