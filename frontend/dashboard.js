// Dashboard Page JavaScript for Hospitality Management System

// Global variables
let currentUser = null;
let hotels = [];
let currentReservations = [];

// API base URL
const API_BASE = '/api';

// DOM elements
const logoutBtn = document.getElementById('logoutBtn');
const currentUserSpan = document.getElementById('currentUser');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupDashboardEventListeners();
    setMinDates();
});

function initializeDashboard() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('hospitalityUser');
    if (!savedUser) {
        // Redirect to login if not logged in
        window.location.href = 'login.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(savedUser);
        currentUserSpan.textContent = `Welcome, ${currentUser.Username}`;
        
        // Show management tab for admin users
        if (currentUser.Role === 'Admin') {
            document.getElementById('managementTab').style.display = 'block';
        }
        
        // Load initial data
        loadInitialData();
        
    } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('hospitalityUser');
        window.location.href = 'login.html';
    }
}

function setupDashboardEventListeners() {
    // Logout button
    logoutBtn.addEventListener('click', handleLogout);
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Availability check
    document.getElementById('checkAvailabilityBtn').addEventListener('click', checkRoomAvailability);
    
    // Hotel selection handlers
    document.getElementById('availHotel').addEventListener('change', updateRoomsList);
    document.getElementById('resHotel').addEventListener('change', updateRoomsList);
    document.getElementById('roomHotel').addEventListener('change', updateRoomsList);
    
    // Reservation form
    document.getElementById('reservationForm').addEventListener('submit', handleCreateReservation);
    
    // Management forms (Admin only)
    document.getElementById('hotelForm').addEventListener('submit', handleAddHotel);
    document.getElementById('roomForm').addEventListener('submit', handleAddRoom);
    
    // Refresh reservations
    document.getElementById('refreshReservations').addEventListener('click', loadReservations);
    
    // Status filter
    document.getElementById('statusFilter').addEventListener('change', loadReservations);
}

function setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('availCheckIn').setAttribute('min', today);
    document.getElementById('availCheckOut').setAttribute('min', today);
    document.getElementById('resCheckIn').setAttribute('min', today);
    document.getElementById('resCheckOut').setAttribute('min', today);
    
    // Update min checkout date when checkin changes
    document.getElementById('availCheckIn').addEventListener('change', function() {
        const checkIn = this.value;
        const checkOut = document.getElementById('availCheckOut');
        checkOut.setAttribute('min', checkIn);
        if (checkOut.value && checkOut.value <= checkIn) {
            checkOut.value = '';
        }
    });
    
    document.getElementById('resCheckIn').addEventListener('change', function() {
        const checkIn = this.value;
        const checkOut = document.getElementById('resCheckOut');
        checkOut.setAttribute('min', checkIn);
        if (checkOut.value && checkOut.value <= checkIn) {
            checkOut.value = '';
        }
    });
}

// Authentication functions
function handleLogout() {
    // Clear user data
    localStorage.removeItem('hospitalityUser');
    currentUser = null;
    currentReservations = [];
    hotels = [];
    
    // Redirect to login
    window.location.href = 'login.html';
}

// UI Helper functions
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    // Load data based on tab
    if (tabName === 'reservations') {
        loadReservations();
    } else if (tabName === 'availability' || tabName === 'newReservation' || tabName === 'management') {
        loadHotels();
    }
}

function showLoading(show) {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

function showMessage(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 3000);
        }
    }
}

function clearAllMessages() {
    document.querySelectorAll('.message').forEach(msg => {
        msg.style.display = 'none';
        msg.textContent = '';
        msg.className = 'message';
    });
}

// Data loading functions
async function loadInitialData() {
    try {
        showLoading(true);
        await loadHotels();
        await loadReservations();
    } catch (error) {
        console.error('Error loading initial data:', error);
    } finally {
        showLoading(false);
    }
}

async function loadHotels() {
    try {
        const response = await fetch(`${API_BASE}/hotels`);
        const data = await response.json();
        
        if (data.success) {
            hotels = data.hotels;
            populateHotelSelects();
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
    }
}

function populateHotelSelects() {
    const selects = ['availHotel', 'resHotel', 'roomHotel'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Hotel</option>';
            
            hotels.forEach(hotel => {
                const option = document.createElement('option');
                option.value = hotel.HotelID;
                option.textContent = hotel.HotelName;
                select.appendChild(option);
            });
        }
    });
}

function updateRoomsList() {
    const selectId = this.id;
    const hotelId = this.value;
    let roomSelectId = '';
    
    // Determine which room select to update
    if (selectId === 'availHotel') {
        roomSelectId = 'availRoom';
    } else if (selectId === 'resHotel') {
        roomSelectId = 'resRoom';
    }
    
    if (roomSelectId) {
        const roomSelect = document.getElementById(roomSelectId);
        roomSelect.innerHTML = '<option value="">Select Room</option>';
        
        if (hotelId) {
            const hotel = hotels.find(h => h.HotelID == hotelId);
            if (hotel && hotel.rooms) {
                hotel.rooms.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room.RoomID;
                    option.textContent = `${room.RoomNumber} - ${room.RoomType} ($${room.RatePerNight}/night)`;
                    roomSelect.appendChild(option);
                });
            }
        }
    }
}

async function loadReservations() {
    const status = document.getElementById('statusFilter').value;
    
    try {
        showLoading(true);
        const url = status ? `${API_BASE}/reservations?status=${status}` : `${API_BASE}/reservations`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            currentReservations = data.reservations;
            displayReservations();
        }
    } catch (error) {
        console.error('Error loading reservations:', error);
        showMessage('reservationMessage', 'Error loading reservations', 'error');
    } finally {
        showLoading(false);
    }
}

function displayReservations() {
    const container = document.getElementById('reservationsList');
    
    if (currentReservations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No reservations found</h3>
                <p>No reservations match your current filter criteria.</p>
            </div>
        `;
        return;
    }

    // Create beautiful table structure
    container.innerHTML = `
        <table class="rooms-table">
            <thead>
                <tr>
                    <th>Guest Name</th>
                    <th>Hotel & Room</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                    <th>Contact</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${currentReservations.map(reservation => `
                    <tr>
                        <td>
                            <strong>${reservation.GuestName}</strong>
                            <br><small>by ${reservation.CreatedBy}</small>
                        </td>
                        <td>
                            <strong>${reservation.HotelName}</strong>
                            <br>Room ${reservation.RoomNumber} (${reservation.RoomType})
                        </td>
                        <td>${formatDate(reservation.CheckInDate)}</td>
                        <td>${formatDate(reservation.CheckOutDate)}</td>
                        <td>
                            <span class="status-badge status-${reservation.Status.toLowerCase().replace(' ', '-')}">
                                ${reservation.Status}
                            </span>
                        </td>
                        <td>${reservation.GuestPhone}</td>
                        <td class="actions-cell">
                            ${getReservationActions(reservation)}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function getReservationActions(reservation) {
    const actions = [];
    
    if (reservation.Status === 'Confirmed') {
        actions.push(`<button class="table-action-button btn-success" onclick="checkIn(${reservation.ReservationID})">Check In</button>`);
        actions.push(`<button class="table-action-button btn-danger" onclick="cancelReservation(${reservation.ReservationID})">Cancel</button>`);
    } else if (reservation.Status === 'CheckedIn') {
        actions.push(`<button class="table-action-button btn-warning" onclick="checkOut(${reservation.ReservationID})">Check Out</button>`);
    }
    
    return actions.length > 0 ? actions.join('') : '<span class="text-muted">No actions</span>';
}

// Room availability functions
async function checkRoomAvailability() {
    const roomId = document.getElementById('availRoom').value;
    const checkInDate = document.getElementById('availCheckIn').value;
    const checkOutDate = document.getElementById('availCheckOut').value;
    
    if (!roomId || !checkInDate || !checkOutDate) {
        showMessage('availabilityMessage', 'Please fill in all fields', 'error');
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/check-availability`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ roomId, checkInDate, checkOutDate })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayAvailabilityResult(data.availability);
            
            // If not available, show alternatives
            if (data.availability.AvailabilityStatus === 'Not Available') {
                await showAlternativeRooms(checkInDate, checkOutDate);
            }
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        showMessage('availabilityMessage', 'Error checking availability', 'error');
    } finally {
        showLoading(false);
    }
}

function displayAvailabilityResult(availability) {
    const resultDiv = document.getElementById('availabilityResult');
    const isAvailable = availability.AvailabilityStatus === 'Available';
    
    resultDiv.innerHTML = `
        <div class="availability-result ${isAvailable ? 'available' : 'unavailable'}">
            <div class="result-icon">${isAvailable ? '✅' : '❌'}</div>
            <div class="result-text">
                <h3>Room ${isAvailable ? 'is Available' : 'is Not Available'}</h3>
                <p>${isAvailable ? 'You can proceed with the reservation.' : `${availability.ConflictingReservations} conflicting reservation(s) found.`}</p>
            </div>
        </div>
    `;
}

async function showAlternativeRooms(checkInDate, checkOutDate) {
    const hotelId = document.getElementById('availHotel').value;
    
    try {
        const response = await fetch(`${API_BASE}/available-rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ hotelId, checkInDate, checkOutDate })
        });
        
        const data = await response.json();
        
        if (data.success && data.rooms.length > 0) {
            displayAlternativeRooms(data.rooms);
        } else {
            document.getElementById('alternativeRooms').innerHTML = `
                <div class="alternative-rooms-section">
                    <h3>💡 Alternative Options</h3>
                    <p>No alternative rooms available for the selected dates. Please try different dates.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading alternative rooms:', error);
    }
}

function displayAlternativeRooms(rooms) {
    const container = document.getElementById('alternativeRooms');
    
    container.innerHTML = `
        <div class="alternative-rooms-section">
            <h3>💡 Alternative Available Rooms</h3>
            <div class="room-grid">
                ${rooms.map(room => `
                    <div class="room-card" onclick="selectAlternativeRoom(${room.RoomID})">
                        <div class="room-header">
                            <div class="room-number">Room ${room.RoomNumber}</div>
                            <div class="room-rate">$${room.RatePerNight}/night</div>
                        </div>
                        <div class="room-details">
                            <div class="room-type">${room.RoomType}</div>
                            <div class="room-hotel">${room.HotelName}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function selectAlternativeRoom(roomId) {
    document.getElementById('availRoom').value = roomId;
    checkRoomAvailability();
}

// Reservation management functions
async function handleCreateReservation(e) {
    e.preventDefault();
    
    const formData = {
        userId: currentUser.UserID,
        roomId: document.getElementById('resRoom').value,
        guestName: document.getElementById('guestName').value,
        guestPhone: document.getElementById('guestPhone').value,
        guestEmail: document.getElementById('guestEmail').value,
        checkInDate: document.getElementById('resCheckIn').value,
        checkOutDate: document.getElementById('resCheckOut').value
    };
    
    try {
        showLoading(true);
        
        // First check availability
        const availResponse = await fetch(`${API_BASE}/check-availability`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                roomId: formData.roomId,
                checkInDate: formData.checkInDate,
                checkOutDate: formData.checkOutDate
            })
        });
        
        const availData = await availResponse.json();
        
        if (availData.success && availData.availability.AvailabilityStatus === 'Not Available') {
            showMessage('reservationMessage', 'Selected room is not available for these dates. Please check availability first.', 'error');
            return;
        }
        
        // Create reservation
        const response = await fetch(`${API_BASE}/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('reservationMessage', `Reservation created successfully! ID: ${data.reservationId}`, 'success');
            document.getElementById('reservationForm').reset();
            
            // Refresh reservations if on that tab
            if (document.getElementById('reservations').classList.contains('active')) {
                loadReservations();
            }
        } else {
            showMessage('reservationMessage', data.message || 'Failed to create reservation', 'error');
        }
    } catch (error) {
        console.error('Error creating reservation:', error);
        showMessage('reservationMessage', 'Connection error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function checkIn(reservationId) {
    if (!confirm('Confirm check-in for this guest?')) {
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/checkin/${reservationId}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadReservations(); // Refresh the list
            showMessage('reservationMessage', 'Guest checked in successfully!', 'success');
        } else {
            showMessage('reservationMessage', data.message || 'Check-in failed', 'error');
        }
    } catch (error) {
        console.error('Check-in error:', error);
        showMessage('reservationMessage', 'Connection error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function checkOut(reservationId) {
    if (!confirm('Confirm check-out for this guest? This will generate the final bill.')) {
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/checkout/${reservationId}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadReservations(); // Refresh the list
            
            if (data.bill) {
                const billMessage = `Guest checked out successfully!\n\nBill Details:\nNights: ${data.bill.NumberOfNights}\nRate: $${data.bill.RatePerNight}/night\nTotal: $${data.bill.TotalAmount}`;
                alert(billMessage);
            } else {
                showMessage('reservationMessage', 'Guest checked out successfully!', 'success');
            }
        } else {
            showMessage('reservationMessage', data.message || 'Check-out failed', 'error');
        }
    } catch (error) {
        console.error('Check-out error:', error);
        showMessage('reservationMessage', 'Connection error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function cancelReservation(reservationId) {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
        return;
    }
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/reservations/${reservationId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'Cancelled' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            loadReservations(); // Refresh the list
            showMessage('reservationMessage', 'Reservation cancelled successfully!', 'success');
        } else {
            showMessage('reservationMessage', data.message || 'Cancellation failed', 'error');
        }
    } catch (error) {
        console.error('Cancellation error:', error);
        showMessage('reservationMessage', 'Connection error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Management functions (Admin only)
async function handleAddHotel(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('hotelName').value,
        address: document.getElementById('hotelAddress').value,
        phone: document.getElementById('hotelPhone').value
    };
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/hotels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('managementMessage', `Hotel added successfully! ID: ${data.hotelId}`, 'success');
            document.getElementById('hotelForm').reset();
            await loadHotels(); // Refresh hotel list
        } else {
            showMessage('managementMessage', data.message || 'Failed to add hotel', 'error');
        }
    } catch (error) {
        console.error('Error adding hotel:', error);
        showMessage('managementMessage', 'Connection error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleAddRoom(e) {
    e.preventDefault();
    
    const formData = {
        hotelId: document.getElementById('roomHotel').value,
        roomNumber: document.getElementById('roomNumber').value,
        roomType: document.getElementById('roomType').value,
        ratePerNight: parseFloat(document.getElementById('roomRate').value),
        maxOccupancy: parseInt(document.getElementById('roomOccupancy').value)
    };
    
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('managementMessage', `Room added successfully! ID: ${data.roomId}`, 'success');
            document.getElementById('roomForm').reset();
            await loadHotels(); // Refresh hotel/room list
        } else {
            showMessage('managementMessage', data.message || 'Failed to add room', 'error');
        }
    } catch (error) {
        console.error('Error adding room:', error);
        showMessage('managementMessage', 'Connection error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
