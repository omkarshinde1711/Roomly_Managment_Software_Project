// Test alternative rooms functionality
const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD || '1711',
    database: 'HospitalityDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

async function testAlternativeRooms() {
    try {
        console.log('🔍 Testing sp_GetAvailableRooms...');
        
        // Test parameters
        const hotelId = 1; // Grand Hotel
        const checkInDate = '2025-07-25';
        const checkOutDate = '2025-07-27';
        const roomType = null; // All room types
        
        console.log('Parameters:', { hotelId, checkInDate, checkOutDate, roomType });
        
        const [result] = await pool.execute('CALL sp_GetAvailableRooms(?, ?, ?, ?)', 
            [hotelId, checkInDate, checkOutDate, roomType]);
        
        console.log('Available rooms found:', result[0].length);
        result[0].forEach((room, index) => {
            console.log(`${index + 1}. Room ${room.RoomNumber} (${room.RoomType}) - $${room.RatePerNight}/night at ${room.HotelName}`);
        });

    } catch (error) {
        console.error('Error testing alternative rooms:', error);
    } finally {
        await pool.end();
    }
}

testAlternativeRooms();
