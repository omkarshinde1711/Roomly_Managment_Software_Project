-- Stored Procedures/Functions for Hospitality Management System - MySQL Version

DELIMITER //

-- 1. User Authentication Function
CREATE PROCEDURE sp_UserLogin(
    IN p_Username VARCHAR(50),
    IN p_Password VARCHAR(255)
)
BEGIN
    SELECT UserID, Username, Role
    FROM Users
    WHERE Username = p_Username 
    AND PasswordHash = SHA2(p_Password, 256);
END //

-- 2. Register Hotel
CREATE PROCEDURE sp_RegisterHotel(
    IN p_Name VARCHAR(100),
    IN p_Address VARCHAR(255),
    IN p_Phone VARCHAR(20)
)
BEGIN
    INSERT INTO Hotels (Name, Address, Phone)
    VALUES (p_Name, p_Address, p_Phone);
    
    SELECT LAST_INSERT_ID() AS HotelID;
END //

-- 3. Register Room
CREATE PROCEDURE sp_RegisterRoom(
    IN p_HotelID INT,
    IN p_RoomNumber VARCHAR(10),
    IN p_RoomType VARCHAR(50),
    IN p_RatePerNight DECIMAL(10, 2),
    IN p_MaxOccupancy INT
)
BEGIN
    INSERT INTO Rooms (HotelID, RoomNumber, RoomType, RatePerNight, MaxOccupancy)
    VALUES (p_HotelID, p_RoomNumber, p_RoomType, p_RatePerNight, p_MaxOccupancy);
    
    SELECT LAST_INSERT_ID() AS RoomID;
END //

-- 4. Check Room Availability (Core Feature)
CREATE PROCEDURE sp_CheckRoomAvailability(
    IN p_RoomID INT,
    IN p_CheckInDate DATE,
    IN p_CheckOutDate DATE
)
BEGIN
    DECLARE v_ConflictCount INT DEFAULT 0;
    
    SELECT COUNT(*) INTO v_ConflictCount
    FROM Reservations
    WHERE RoomID = p_RoomID
    AND Status IN ('Confirmed', 'CheckedIn')
    AND (p_CheckInDate < CheckOutDate AND p_CheckOutDate > CheckInDate);
    
    SELECT 
        CASE 
            WHEN v_ConflictCount = 0 THEN 'Available'
            ELSE 'Not Available'
        END AS AvailabilityStatus,
        v_ConflictCount AS ConflictingReservations;
END //

-- 5. Get Available Rooms (Alternative suggestions)
CREATE PROCEDURE sp_GetAvailableRooms(
    IN p_HotelID INT,
    IN p_CheckInDate DATE,
    IN p_CheckOutDate DATE,
    IN p_RoomType VARCHAR(50)
)
BEGIN
    SELECT 
        r.RoomID,
        r.RoomNumber,
        r.RoomType,
        r.RatePerNight,
        r.MaxOccupancy,
        h.Name AS HotelName
    FROM Rooms r
    INNER JOIN Hotels h ON r.HotelID = h.HotelID
    WHERE (p_HotelID IS NULL OR r.HotelID = p_HotelID)
    AND (p_RoomType IS NULL OR r.RoomType = p_RoomType)
    AND r.RoomID NOT IN (
        SELECT RoomID
        FROM Reservations
        WHERE Status IN ('Confirmed', 'CheckedIn')
        AND (p_CheckInDate < CheckOutDate AND p_CheckOutDate > CheckInDate)
    )
    ORDER BY r.RatePerNight, r.RoomNumber;
END //

-- 6. Create Reservation
CREATE PROCEDURE sp_CreateReservation(
    IN p_UserID INT,
    IN p_RoomID INT,
    IN p_GuestName VARCHAR(100),
    IN p_GuestPhone VARCHAR(20),
    IN p_GuestEmail VARCHAR(100),
    IN p_CheckInDate DATE,
    IN p_CheckOutDate DATE
)
BEGIN
    INSERT INTO Reservations (UserID, RoomID, GuestName, GuestPhone, GuestEmail, CheckInDate, CheckOutDate, Status)
    VALUES (p_UserID, p_RoomID, p_GuestName, p_GuestPhone, p_GuestEmail, p_CheckInDate, p_CheckOutDate, 'Confirmed');
    
    SELECT LAST_INSERT_ID() AS ReservationID;
END //

-- 7. Update Reservation Status
CREATE PROCEDURE sp_UpdateReservationStatus(
    IN p_ReservationID INT,
    IN p_NewStatus VARCHAR(20)
)
BEGIN
    UPDATE Reservations
    SET Status = p_NewStatus
    WHERE ReservationID = p_ReservationID;
    
    SELECT ROW_COUNT() AS RowsAffected;
END //

-- 8. Check In
CREATE PROCEDURE sp_CheckIn(
    IN p_ReservationID INT
)
BEGIN
    CALL sp_UpdateReservationStatus(p_ReservationID, 'CheckedIn');
END //

-- 9. Check Out and Generate Bill
CREATE PROCEDURE sp_CheckOut(
    IN p_ReservationID INT
)
BEGIN
    DECLARE v_TotalAmount DECIMAL(10, 2);
    DECLARE v_RatePerNight DECIMAL(10, 2);
    DECLARE v_NumberOfNights INT;
    DECLARE v_BillID INT;
    
    -- Calculate total amount
    SELECT
        r.RatePerNight,
        DATEDIFF(res.CheckOutDate, res.CheckInDate)
    INTO v_RatePerNight, v_NumberOfNights
    FROM Reservations res
    INNER JOIN Rooms r ON res.RoomID = r.RoomID
    WHERE res.ReservationID = p_ReservationID;
    
    SET v_TotalAmount = v_RatePerNight * v_NumberOfNights;
    
    -- Update reservation status
    CALL sp_UpdateReservationStatus(p_ReservationID, 'CheckedOut');
    
    -- Create bill
    INSERT INTO Bills (ReservationID, TotalAmount, PaymentStatus)
    VALUES (p_ReservationID, v_TotalAmount, 'Unpaid');
    
    SET v_BillID = LAST_INSERT_ID();
    
    -- Return bill details
    SELECT 
        v_BillID AS BillID,
        v_TotalAmount AS TotalAmount,
        v_NumberOfNights AS NumberOfNights,
        v_RatePerNight AS RatePerNight;
END //

-- 10. Generate Bill (separate procedure)
CREATE PROCEDURE sp_GenerateBill(
    IN p_ReservationID INT
)
BEGIN
    DECLARE v_TotalAmount DECIMAL(10, 2);
    DECLARE v_RatePerNight DECIMAL(10, 2);
    DECLARE v_NumberOfNights INT;
    
    SELECT
        r.RatePerNight,
        DATEDIFF(res.CheckOutDate, res.CheckInDate)
    INTO v_RatePerNight, v_NumberOfNights
    FROM Reservations res
    INNER JOIN Rooms r ON res.RoomID = r.RoomID
    WHERE res.ReservationID = p_ReservationID;
    
    SET v_TotalAmount = v_RatePerNight * v_NumberOfNights;
    
    INSERT INTO Bills (ReservationID, TotalAmount, PaymentStatus)
    VALUES (p_ReservationID, v_TotalAmount, 'Unpaid');
    
    SELECT 
        LAST_INSERT_ID() AS BillID,
        v_TotalAmount AS TotalAmount,
        v_NumberOfNights AS NumberOfNights,
        v_RatePerNight AS RatePerNight;
END //

-- 11. Get All Reservations
CREATE PROCEDURE sp_GetAllReservations(
    IN p_HotelID INT,
    IN p_Status VARCHAR(20)
)
BEGIN
    SELECT 
        res.ReservationID,
        res.GuestName,
        res.GuestPhone,
        res.CheckInDate,
        res.CheckOutDate,
        res.Status,
        r.RoomNumber,
        r.RoomType,
        h.Name AS HotelName,
        u.Username AS CreatedBy
    FROM Reservations res
    INNER JOIN Rooms r ON res.RoomID = r.RoomID
    INNER JOIN Hotels h ON r.HotelID = h.HotelID
    INNER JOIN Users u ON res.UserID = u.UserID
    WHERE (p_HotelID IS NULL OR h.HotelID = p_HotelID)
    AND (p_Status IS NULL OR res.Status = p_Status)
    ORDER BY res.CheckInDate DESC;
END //

-- 12. Get Hotels and Rooms
CREATE PROCEDURE sp_GetHotelsWithRooms()
BEGIN
    SELECT 
        h.HotelID,
        h.Name AS HotelName,
        h.Address,
        h.Phone,
        r.RoomID,
        r.RoomNumber,
        r.RoomType,
        r.RatePerNight,
        r.MaxOccupancy
    FROM Hotels h
    LEFT JOIN Rooms r ON h.HotelID = r.HotelID
    ORDER BY h.Name, r.RoomNumber;
END //

DELIMITER ;
