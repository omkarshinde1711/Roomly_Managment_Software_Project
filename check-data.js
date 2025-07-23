// Check sample data in database
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

async function checkData() {
    try {
        console.log('🏨 Checking Hotels...');
        const [hotels] = await pool.execute('SELECT * FROM hotels');
        console.log('Hotels found:', hotels.length);
        if (hotels.length > 0) {
            console.log('Sample hotel:', hotels[0]);
        }

        console.log('\n🏠 Checking Rooms...');
        const [rooms] = await pool.execute('SELECT * FROM rooms');
        console.log('Rooms found:', rooms.length);
        if (rooms.length > 0) {
            console.log('Sample room:', rooms[0]);
        }

        console.log('\n📅 Checking Reservations...');
        const [reservations] = await pool.execute('SELECT * FROM reservations');
        console.log('Reservations found:', reservations.length);
        if (reservations.length > 0) {
            console.log('Sample reservation:', reservations[0]);
        }

        // Test availability check for first room
        if (rooms.length > 0) {
            console.log('\n🔍 Testing availability check for first room...');
            const testCheckIn = '2025-07-25';
            const testCheckOut = '2025-07-27';
            
            const [result] = await pool.execute('CALL sp_CheckRoomAvailability(?, ?, ?)', 
                [rooms[0].RoomID, testCheckIn, testCheckOut]);
            
            console.log('Availability test result:', result[0][0]);
        }

    } catch (error) {
        console.error('Error checking data:', error);
    } finally {
        await pool.end();
    }
}

checkData();
