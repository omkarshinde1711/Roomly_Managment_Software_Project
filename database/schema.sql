-- Hospitality Management System Database Schema - MySQL Version
-- Create database and tables

-- Create database (uncomment if needed)
-- CREATE DATABASE HospitalityDB;
-- USE HospitalityDB;

-- Users Table - Stores system users (staff, admin)
CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(20) NOT NULL DEFAULT 'Staff', -- 'Admin', 'Staff'
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Hotels Table - Stores hotel information
CREATE TABLE Hotels (
    HotelID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Address VARCHAR(255),
    Phone VARCHAR(20),
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rooms Table - Stores room information
CREATE TABLE Rooms (
    RoomID INT PRIMARY KEY AUTO_INCREMENT,
    HotelID INT NOT NULL,
    RoomNumber VARCHAR(10) NOT NULL,
    RoomType VARCHAR(50) NOT NULL, -- 'Single', 'Double', 'Suite', 'Deluxe'
    RatePerNight DECIMAL(10, 2) NOT NULL,
    MaxOccupancy INT DEFAULT 2,
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    UNIQUE KEY UQ_Hotel_RoomNumber (HotelID, RoomNumber)
);

-- Reservations Table - Stores booking information
CREATE TABLE Reservations (
    ReservationID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    RoomID INT NOT NULL,
    GuestName VARCHAR(100) NOT NULL,
    GuestPhone VARCHAR(20),
    GuestEmail VARCHAR(100),
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'Confirmed', -- 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    CHECK (CheckOutDate > CheckInDate)
);

-- Bills Table - Stores billing information
CREATE TABLE Bills (
    BillID INT PRIMARY KEY AUTO_INCREMENT,
    ReservationID INT NOT NULL,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    PaymentStatus VARCHAR(20) NOT NULL DEFAULT 'Unpaid', -- 'Paid', 'Unpaid', 'Refunded'
    CreatedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID)
);

-- Insert sample data for testing
INSERT INTO Users (Username, PasswordHash, Role) VALUES
('admin', SHA2('admin123', 256), 'Admin'),
('staff1', SHA2('staff123', 256), 'Staff'),
('reception', SHA2('reception123', 256), 'Staff');

INSERT INTO Hotels (Name, Address, Phone) VALUES
('Grand Hotel', '123 Main Street, City Center', '+1-555-0101'),
('Business Inn', '456 Corporate Ave, Business District', '+1-555-0102');

INSERT INTO Rooms (HotelID, RoomNumber, RoomType, RatePerNight, MaxOccupancy) VALUES
(1, '101', 'Single', 99.99, 1),
(1, '102', 'Double', 149.99, 2),
(1, '103', 'Suite', 299.99, 4),
(1, '201', 'Single', 99.99, 1),
(1, '202', 'Double', 149.99, 2),
(2, '101', 'Single', 79.99, 1),
(2, '102', 'Double', 119.99, 2),
(2, '103', 'Deluxe', 199.99, 3);
