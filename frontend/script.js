// Hospitality Management System - Frontend JavaScript

// Global variables
let currentUser = null;
let hotels = [];
let currentReservations = [];

// API base URL
const API_BASE = '/api';

// DOM elements
const loginSection = document.getElementById('loginSection');
const dashboardSection = document.getElementById('dashboardSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const currentUserSpan = document.getElementById('currentUser');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    setMinDates();
});

function initializeApp() {
    // Check if user is already logged in (in a real app, check JWT token)
    showSection('login');
}

function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
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
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentUser = data.user;
            currentUserSpan.textContent = `Welcome, ${currentUser.Username}`;
            
            // Show management tab for admin users
            if (currentUser.Role === 'Admin') {
                document.getElementById('managementTab').style.display = 'block';
            }
            
            showSection('dashboard');
            await loadInitialData();
            showMessage('loginMessage', 'Login successful!', 'success');
        } else {
            showMessage('loginMessage', data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMessage', 'Connection error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

function handleLogout() {
    currentUser = null;
    currentReservations = [];
    hotels = [];
    showSection('login');
    
    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('managementTab').style.display = 'none';
    
    // Clear messages
    clearAllMessages();
}

// UI Helper functions
function showSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    if (sectionName === 'login') {
        loginSection.classList.add('active');
    } else {
        dashboardSection.classList.add('active');
    }
}

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
    if (show) {
        loadingOverlay.classList.add('show');
    } else {
        loadingOverlay.classList.remove('show');
    }
}

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
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

function clearAllMessages() {
    document.querySelectorAll('.message').forEach(msg => {
        msg.style.display = 'none';
        msg.textContent = '';
        msg.className = 'message';
    });
}

// Data loading functions
async function loadInitialData() {
    await loadHotels();
    await loadReservations();
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
        select.innerHTML = '<option value="">Select Hotel</option>';
        
        hotels.forEach(hotel => {
            const option = document.createElement('option');
            option.value = hotel.HotelID;
            option.textContent = hotel.HotelName;
            select.appendChild(option);
        });
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
    } finally {
        showLoading(false);
    }
}

function displayReservations() {
    const container = document.getElementById('reservationsList');
    
    if (currentReservations.length === 0) {
        container.innerHTML = '<p>No reservations found.</p>';
        return;
    }
    
    container.innerHTML = currentReservations.map(reservation => `
        <div class="reservation-card">
            <div class="reservation-header">
                <div class="guest-name">${reservation.GuestName}</div>
                <div class="status-badge status-${reservation.Status.toLowerCase()}">${reservation.Status}</div>
            </div>
            <div class="reservation-details">
                <div class="detail-item">
                    <span class="detail-label">Hotel:</span> ${reservation.HotelName}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Room:</span> ${reservation.RoomNumber} (${reservation.RoomType})
                </div>
                <div class="detail-item">
                    <span class="detail-label">Check-in:</span> ${formatDate(reservation.CheckInDate)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Check-out:</span> ${formatDate(reservation.CheckOutDate)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone:</span> ${reservation.GuestPhone}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Created by:</span> ${reservation.CreatedBy}
                </div>
            </div>
            <div class="reservation-actions">
                ${getReservationActions(reservation)}
            </div>
        </div>
    `).join('');
}

function getReservationActions(reservation) {
    const actions = [];
    
    if (reservation.Status === 'Confirmed') {
        actions.push(`<button class="btn btn-success btn-sm" onclick="checkIn(${reservation.ReservationID})">Check In</button>`);
        actions.push(`<button class="btn btn-danger btn-sm" onclick="cancelReservation(${reservation.ReservationID})">Cancel</button>`);
    } else if (reservation.Status === 'CheckedIn') {
        actions.push(`<button class="btn btn-warning btn-sm" onclick="checkOut(${reservation.ReservationID})">Check Out</button>`);
    }
    
    return actions.join('');
}

// Room availability functions
async function checkRoomAvailability() {
    const roomId = document.getElementById('availRoom').value;
    const checkInDate = document.getElementById('availCheckIn').value;
    const checkOutDate = document.getElementById('availCheckOut').value;
    
    if (!roomId || !checkInDate || !checkOutDate) {
        alert('Please fill in all fields');
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
    } finally {
        showLoading(false);
    }
}

function displayAvailabilityResult(availability) {
    const resultDiv = document.getElementById('availabilityResult');
    const isAvailable = availability.AvailabilityStatus === 'Available';
    
    resultDiv.innerHTML = `
        <div class="availability-${isAvailable ? 'available' : 'unavailable'}">
            🏨 Room ${isAvailable ? 'is Available' : 'is Not Available'} for the selected dates
            ${!isAvailable ? `<br><small>Conflicting reservations: ${availability.ConflictingReservations}</small>` : ''}
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
                <h3>💡 Alternative Options</h3>
                <p>No alternative rooms available for the selected dates. Please try different dates.</p>
            `;
        }
    } catch (error) {
        console.error('Error loading alternative rooms:', error);
    }
}

function displayAlternativeRooms(rooms) {
    const container = document.getElementById('alternativeRooms');
    
    container.innerHTML = `
        <h3>💡 Alternative Available Rooms</h3>
        <div class="room-grid">
            ${rooms.map(room => `
                <div class="room-card" onclick="selectAlternativeRoom(${room.RoomID})">
                    <div class="room-number">Room ${room.RoomNumber}</div>
                    <div class="room-type">${room.RoomType}</div>
                    <div class="room-rate">$${room.RatePerNight}/night</div>
                    <div style="color: #666; font-size: 0.9rem;">${room.HotelName}</div>
                </div>
            `).join('')}
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
            alert('Guest checked in successfully!');
        } else {
            alert(data.message || 'Check-in failed');
        }
    } catch (error) {
        console.error('Check-in error:', error);
        alert('Connection error. Please try again.');
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
                alert(`Guest checked out successfully!\n\nBill Details:\nNights: ${data.bill.NumberOfNights}\nRate: $${data.bill.RatePerNight}/night\nTotal: $${data.bill.TotalAmount}`);
            } else {
                alert('Guest checked out successfully!');
            }
        } else {
            alert(data.message || 'Check-out failed');
        }
    } catch (error) {
        console.error('Check-out error:', error);
        alert('Connection error. Please try again.');
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
            alert('Reservation cancelled successfully!');
        } else {
            alert(data.message || 'Cancellation failed');
        }
    } catch (error) {
        console.error('Cancellation error:', error);
        alert('Connection error. Please try again.');
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
