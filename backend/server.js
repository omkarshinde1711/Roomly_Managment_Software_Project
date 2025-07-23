// Express server for Hospitality Management System API
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { pool } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes

// 1. User Login
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [rows] = await pool.execute('CALL sp_UserLogin(?, ?)', [username, password]);
        
        if (rows.length > 0 && rows[0].length > 0) {
            const userData = rows[0][0];
            
            // Normalize the user data for frontend consistency
            const normalizedUser = {
                UserID: userData.UserID,
                Username: userData.Username,
                Role: userData.Role,
                name: userData.Username // Use username as display name
            };
            
            res.json({
                success: true,
                user: normalizedUser
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 2. Get Hotels with Rooms
app.get('/api/hotels', async (req, res) => {
    try {
        const [rows] = await pool.execute('CALL sp_GetHotelsWithRooms()');
        
        // Group results by hotel
        const hotels = {};
        rows[0].forEach(row => {
            if (!hotels[row.HotelID]) {
                hotels[row.HotelID] = {
                    HotelID: row.HotelID,
                    HotelName: row.HotelName,
                    Address: row.Address,
                    Phone: row.Phone,
                    rooms: []
                };
            }
            
            if (row.RoomID) {
                hotels[row.HotelID].rooms.push({
                    RoomID: row.RoomID,
                    RoomNumber: row.RoomNumber,
                    RoomType: row.RoomType,
                    RatePerNight: row.RatePerNight,
                    MaxOccupancy: row.MaxOccupancy
                });
            }
        });
        
        res.json({
            success: true,
            hotels: Object.values(hotels)
        });
    } catch (err) {
        console.error('Get hotels error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 3. Check Room Availability
app.post('/api/check-availability', async (req, res) => {
    try {
        const { roomId, checkInDate, checkOutDate } = req.body;
        
        const [rows] = await pool.execute('CALL sp_CheckRoomAvailability(?, ?, ?)', 
            [roomId, checkInDate, checkOutDate]);
        
        res.json({
            success: true,
            availability: rows[0][0]
        });
    } catch (err) {
        console.error('Check availability error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 4. Get Available Rooms (Alternatives)
app.post('/api/available-rooms', async (req, res) => {
    try {
        const { hotelId, checkInDate, checkOutDate, roomType } = req.body;
        
        const [rows] = await pool.execute('CALL sp_GetAvailableRooms(?, ?, ?, ?)', 
            [hotelId || null, checkInDate, checkOutDate, roomType || null]);
        
        res.json({
            success: true,
            rooms: rows[0]
        });
    } catch (err) {
        console.error('Get available rooms error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get Available Rooms - Alternative endpoint path
app.post('/api/rooms/available', async (req, res) => {
    try {
        const { hotelId, checkInDate, checkOutDate, roomType } = req.body;
        
        const [rows] = await pool.execute('CALL sp_GetAvailableRooms(?, ?, ?, ?)', 
            [hotelId || null, checkInDate, checkOutDate, roomType || null]);
        
        res.json({
            success: true,
            rooms: rows[0]
        });
    } catch (err) {
        console.error('Get available rooms error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 5. Create Reservation
app.post('/api/reservations', async (req, res) => {
    try {
        console.log('Create reservation request body:', req.body); // Debug log
        
        const { userId, roomId, guestName, guestPhone, guestEmail, checkInDate, checkOutDate } = req.body;
        
        console.log('Extracted values:', { userId, roomId, guestName, guestPhone, guestEmail, checkInDate, checkOutDate }); // Debug log
        
        // Validate required fields
        if (!userId || !roomId || !guestName || !checkInDate || !checkOutDate) {
            console.log('Validation failed - missing fields:', { userId: !!userId, roomId: !!roomId, guestName: !!guestName, checkInDate: !!checkInDate, checkOutDate: !!checkOutDate });
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, roomId, guestName, checkInDate, checkOutDate'
            });
        }
        
        const [rows] = await pool.execute('CALL sp_CreateReservation(?, ?, ?, ?, ?, ?, ?)', 
            [userId, roomId, guestName, guestPhone || null, guestEmail || null, checkInDate, checkOutDate]);
        
        res.json({
            success: true,
            reservationId: rows[0][0].ReservationID
        });
    } catch (err) {
        console.error('Create reservation error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 6. Get All Reservations
app.get('/api/reservations', async (req, res) => {
    try {
        const { hotelId, status } = req.query;
        
        const [rows] = await pool.execute('CALL sp_GetAllReservations(?, ?)', 
            [hotelId || null, status || null]);
        
        res.json({
            success: true,
            reservations: rows[0]
        });
    } catch (err) {
        console.error('Get reservations error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 7. Check In
app.post('/api/checkin/:id', async (req, res) => {
    try {
        const reservationId = req.params.id;
        
        await pool.execute('CALL sp_CheckIn(?)', [reservationId]);
        
        res.json({
            success: true,
            message: 'Guest checked in successfully'
        });
    } catch (err) {
        console.error('Check in error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 8. Check Out
app.post('/api/checkout/:id', async (req, res) => {
    try {
        const reservationId = req.params.id;
        
        const [rows] = await pool.execute('CALL sp_CheckOut(?)', [reservationId]);
        
        res.json({
            success: true,
            message: 'Guest checked out successfully',
            bill: rows[0][0]
        });
    } catch (err) {
        console.error('Check out error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 9. Register Hotel
app.post('/api/hotels', async (req, res) => {
    try {
        const { name, address, phone } = req.body;
        
        const [rows] = await pool.execute('CALL sp_RegisterHotel(?, ?, ?)', 
            [name, address, phone]);
        
        res.json({
            success: true,
            hotelId: rows[0][0].HotelID
        });
    } catch (err) {
        console.error('Register hotel error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 10. Register Room
app.post('/api/rooms', async (req, res) => {
    try {
        const { hotelId, roomNumber, roomType, ratePerNight, maxOccupancy } = req.body;
        
        const [rows] = await pool.execute('CALL sp_RegisterRoom(?, ?, ?, ?, ?)', 
            [hotelId, roomNumber, roomType, ratePerNight, maxOccupancy || 2]);
        
        res.json({
            success: true,
            roomId: rows[0][0].RoomID
        });
    } catch (err) {
        console.error('Register room error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Get rooms by hotel ID
app.get('/api/hotels/:hotelId/rooms', async (req, res) => {
    try {
        const { hotelId } = req.params;
        
        const [rows] = await pool.execute(
            'SELECT RoomID, RoomNumber, RoomType, RatePerNight, MaxOccupancy FROM Rooms WHERE HotelID = ? ORDER BY RoomNumber', 
            [hotelId]
        );
        
        res.json({
            success: true,
            rooms: rows
        });
    } catch (err) {
        console.error('Get rooms by hotel error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Check room availability - Alternative endpoint path
app.post('/api/rooms/availability', async (req, res) => {
    try {
        const { roomId, checkInDate, checkOutDate } = req.body;
        
        const [rows] = await pool.execute('CALL sp_CheckRoomAvailability(?, ?, ?)', 
            [roomId, checkInDate, checkOutDate]);
        
        const result = rows[0][0];
        const isAvailable = result.AvailabilityStatus === 'Available';
        
        res.json({
            success: true,
            available: isAvailable,
            status: result.AvailabilityStatus,
            conflictingReservations: result.ConflictingReservations
        });
    } catch (err) {
        console.error('Check room availability error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 10. Cancel Reservation
app.delete('/api/reservations/:id', async (req, res) => {
    try {
        const reservationId = req.params.id;
        
        await pool.execute('CALL sp_CancelReservation(?)', [reservationId]);
        
        res.json({
            success: true,
            message: 'Reservation cancelled successfully'
        });
    } catch (err) {
        console.error('Cancel reservation error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// 11. Generate Bill (separate endpoint)
app.get('/api/bills/:reservationId', async (req, res) => {
    try {
        const reservationId = req.params.reservationId;
        
        const [rows] = await pool.execute('CALL sp_GenerateBill(?)', [reservationId]);
        
        res.json({
            success: true,
            bill: rows[0][0]
        });
    } catch (err) {
        console.error('Generate bill error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Serve the main HTML file for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
