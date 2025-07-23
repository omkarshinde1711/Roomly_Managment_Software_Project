// Convert USD to INR in database
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

async function convertToINR() {
    try {
        console.log('🪙 Converting USD to INR (1 USD = 83 INR)...');
        
        // Update room rates
        const [roomsResult] = await pool.execute(
            'UPDATE Rooms SET RatePerNight = RatePerNight * 83'
        );
        console.log('✅ Updated room rates:', roomsResult.affectedRows, 'rooms');
        
        // Update bills
        const [billsResult] = await pool.execute(
            'UPDATE Bills SET TotalAmount = TotalAmount * 83'
        );
        console.log('✅ Updated bills:', billsResult.affectedRows, 'bills');
        
        // Show sample data
        const [rooms] = await pool.execute(
            'SELECT RoomNumber, RatePerNight FROM Rooms LIMIT 5'
        );
        console.log('\n📊 Sample Room Rates (INR):');
        rooms.forEach(room => {
            console.log(`  Room ${room.RoomNumber}: ₹${room.RatePerNight}/night`);
        });
        
        console.log('\n🎉 Currency conversion completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during conversion:', error);
    } finally {
        await pool.end();
    }
}

convertToINR();
