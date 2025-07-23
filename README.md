# Roomly Management Software Project

<div align="center">
  <img src="frontend/assets/logo.png" alt="Roomly Logo" width="100"/>
</div>

SQL-focused hotel management system demonstrating comprehensive database design, stored procedures, and real-time availability checking.

## Video Demonstration

<img width="1827" height="1039" alt="Roomly Dashboard" src="https://github.com/user-attachments/assets/83fcee28-2c95-4cd6-aad8-747c6804f54d" />

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
**Alternative Room Suggestions**: Smart recommendations when rooms unavailable  
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
POST /api/check-availability       - Real-time availability check
POST /api/reservations             - Create new reservation
GET  /api/reservations             - Get all reservations
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
**Availability Accuracy**: Real-time status verification  
**Bill Calculation**: Rate × nights validation  
**Alternative Suggestions**: Available room recommendations  
**Status Workflow**: Reservation lifecycle management

## Developer Information

**Project**: SQL-focused Hotel Management System  
**Author**: Omkar Shinde  
**Focus**: Database design, stored procedures, and business logic implementation  
**Completion**: 95% - Production ready

This project demonstrates advanced SQL database design, comprehensive stored procedure implementation, and real-world business logic handling in a hotel management context.
