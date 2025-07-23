-- SQL script to convert USD to INR for Indian-based hotel system
-- Exchange rate: 1 USD = 83 INR (approximate)

USE HospitalityDB;

-- Update room rates from USD to INR
UPDATE Rooms 
SET RatePerNight = RatePerNight * 83;

-- Update existing bills from USD to INR  
UPDATE Bills 
SET TotalAmount = TotalAmount * 83;

-- Verify the updates
SELECT 'Rooms Updated:' as Status, COUNT(*) as Count FROM Rooms;
SELECT 'Sample Room Rates (INR):' as Info, RoomNumber, RatePerNight FROM Rooms LIMIT 5;

SELECT 'Bills Updated:' as Status, COUNT(*) as Count FROM Bills;
SELECT 'Sample Bill Amounts (INR):' as Info, BillID, TotalAmount FROM Bills LIMIT 5;
