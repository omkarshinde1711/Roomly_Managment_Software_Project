// Dashboard JavaScript for HMS

// Global variables
let currentUser = null;
let hotels = [];
let currentReservations = [];

// API base URL
const API_BASE = '/api';

// DOM elements
const currentUserSpan = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    initializeDashboard();
    setupEventListeners();
    setMinDates();
});

function checkAuthentication() {
    const token = localStorage.getItem('hms_token');
    const user = localStorage.getItem('hms_user');
    
    console.log('Checking authentication:', { token: !!token, user }); // Debug log
    
    if (!token || !user) {
        // Not authenticated, redirect to login
        window.location.href = 'index.html';
        return;
    }
    
    try {
        currentUser = JSON.parse(user);
        console.log('Parsed user:', currentUser); // Debug log
        updateUserDisplay();
        
        // Show management tab for admin users
        if (currentUser.role === 'Admin') {
            const managementTab = document.getElementById('managementTab');
            if (managementTab) {
                managementTab.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
    }
}

function updateUserDisplay() {
    if (currentUserSpan && currentUser) {
        console.log('Current user object:', currentUser); // Debug log
        
        // Use the normalized property names
        const displayName = currentUser.name || currentUser.username || 'User';
        
        currentUserSpan.textContent = `Welcome, ${displayName}`;
    } else {
        console.log('Missing currentUserSpan or currentUser:', { currentUserSpan, currentUser });
        if (currentUserSpan) {
            currentUserSpan.textContent = 'Welcome, Guest';
        }
    }
}

function initializeDashboard() {
    loadHotels();
    loadReservations();
}

function setupEventListeners() {
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Availability check
    const checkAvailabilityBtn = document.getElementById('checkAvailabilityBtn');
    if (checkAvailabilityBtn) {
        checkAvailabilityBtn.addEventListener('click', checkRoomAvailability);
    }
    
    // Hotel selection handlers
    const availHotel = document.getElementById('availHotel');
    if (availHotel) {
        availHotel.addEventListener('change', updateRoomsList);
    }
    
    const resHotel = document.getElementById('resHotel');
    if (resHotel) {
        resHotel.addEventListener('change', updateReservationRoomsList);
    }
    
    const roomHotel = document.getElementById('roomHotel');
    if (roomHotel) {
        roomHotel.addEventListener('change', () => {}); // For room management
    }
    
    // Form submissions
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleCreateReservation);
    }
    
    const hotelForm = document.getElementById('hotelForm');
    if (hotelForm) {
        hotelForm.addEventListener('submit', handleCreateHotel);
    }
    
    const roomForm = document.getElementById('roomForm');
    if (roomForm) {
        roomForm.addEventListener('submit', handleCreateRoom);
    }
    
    // Refresh reservations
    const refreshBtn = document.getElementById('refreshReservations');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadReservations);
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterReservations);
    }
}

function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const activeTab = document.getElementById(tabName);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Load data for specific tabs
    if (tabName === 'reservations') {
        loadReservations();
    } else if (tabName === 'management') {
        loadHotelsForManagement();
    }
}

function setMinDates() {
    const today = new Date().toISOString().split('T')[0];
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.min = today;
    });
}

async function loadHotels() {
    try {
        const response = await fetch(`${API_BASE}/hotels`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            hotels = data.hotels || [];
            populateHotelSelects();
        } else {
            console.error('Failed to load hotels');
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
        // Use demo data if API is not available
        hotels = [
            { HotelID: 1, Name: 'Grand Plaza Hotel', Address: '123 Main St' },
            { HotelID: 2, Name: 'Ocean View Resort', Address: '456 Beach Rd' }
        ];
        populateHotelSelects();
    }
}

function populateHotelSelects() {
    const hotelSelects = ['availHotel', 'resHotel', 'roomHotel'];
    
    hotelSelects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">Select Hotel</option>';
            hotels.forEach(hotel => {
                const option = document.createElement('option');
                option.value = hotel.HotelID;
                option.textContent = hotel.Name;
                // Explicitly set styles to ensure visibility
                option.style.color = '#495057';
                option.style.backgroundColor = 'white';
                option.style.webkitTextFillColor = '#495057';
                select.appendChild(option);
            });
            // Force styling on the select element with multiple methods
            select.style.color = '#495057';
            select.style.backgroundColor = 'white';
            select.style.webkitTextFillColor = '#495057';
            select.style.textShadow = 'none';
            
            // Force a repaint
            setTimeout(() => {
                select.style.display = 'none';
                select.offsetHeight; // Trigger reflow
                select.style.display = '';
                select.style.color = '#495057';
                select.style.webkitTextFillColor = '#495057';
            }, 50);
        }
    });
}

async function updateRoomsList() {
    const hotelId = document.getElementById('availHotel').value;
    const roomSelect = document.getElementById('availRoom');
    
    if (!hotelId) {
        roomSelect.innerHTML = '<option value="">Select Room</option>';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/hotels/${hotelId}/rooms`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            populateRoomSelect(roomSelect, data.rooms || []);
        } else {
            console.error('Failed to load rooms');
        }
    } catch (error) {
        console.error('Error loading rooms:', error);
        // Demo data
        const demoRooms = [
            { RoomID: 1, RoomNumber: '101', RoomType: 'Single', RatePerNight: 100 },
            { RoomID: 2, RoomNumber: '102', RoomType: 'Double', RatePerNight: 150 }
        ];
        populateRoomSelect(roomSelect, demoRooms);
    }
}

async function updateReservationRoomsList() {
    const hotelId = document.getElementById('resHotel').value;
    const roomSelect = document.getElementById('resRoom');
    
    if (!hotelId) {
        roomSelect.innerHTML = '<option value="">Select Room</option>';
        return;
    }
    
    // Same logic as updateRoomsList but for reservation form
    await updateRoomsList();
    const availRoomOptions = document.getElementById('availRoom').innerHTML;
    roomSelect.innerHTML = availRoomOptions;
}

function populateRoomSelect(select, rooms) {
    select.innerHTML = '<option value="">Select Room</option>';
    rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.RoomID;
        option.textContent = `${room.RoomNumber} - ${room.RoomType} ($${room.RatePerNight}/night)`;
        // Explicitly set styles to ensure visibility
        option.style.color = '#495057';
        option.style.backgroundColor = 'white';
        select.appendChild(option);
    });
    // Ensure the select element itself has proper styling
    select.style.color = '#495057';
    select.style.backgroundColor = 'white';
}

async function checkRoomAvailability() {
    const hotelId = document.getElementById('availHotel').value;
    const roomId = document.getElementById('availRoom').value;
    const checkIn = document.getElementById('availCheckIn').value;
    const checkOut = document.getElementById('availCheckOut').value;
    
    if (!hotelId || !roomId || !checkIn || !checkOut) {
        showAvailabilityResult('Please fill in all fields', false);
        return;
    }
    
    if (new Date(checkIn) >= new Date(checkOut)) {
        showAvailabilityResult('Check-out date must be after check-in date', false);
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/rooms/availability`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                roomId,
                checkInDate: checkIn,
                checkOutDate: checkOut
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAvailabilityResult(
                data.available ? 'Room is available!' : 'Room is not available for selected dates',
                data.available
            );
            
            if (!data.available && data.alternatives) {
                showAlternativeRooms(data.alternatives);
            }
        } else {
            showAvailabilityResult(data.message || 'Error checking availability', false);
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        // Demo logic
        const isAvailable = Math.random() > 0.3; // 70% chance of availability
        showAvailabilityResult(
            isAvailable ? 'Room is available!' : 'Room is not available for selected dates',
            isAvailable
        );
    } finally {
        showLoading(false);
    }
}

function showAvailabilityResult(message, isAvailable) {
    const resultDiv = document.getElementById('availabilityResult');
    if (resultDiv) {
        resultDiv.textContent = message;
        resultDiv.className = `availability-result ${isAvailable ? 'availability-available' : 'availability-unavailable'}`;
        resultDiv.style.display = 'block';
    }
}

function showAlternativeRooms(alternatives) {
    const alternativeDiv = document.getElementById('alternativeRooms');
    if (!alternativeDiv || !alternatives.length) return;
    
    let html = '<h3>Alternative Available Rooms</h3><div class="room-grid">';
    
    alternatives.forEach(room => {
        html += `
            <div class="room-card" onclick="selectAlternativeRoom(${room.RoomID})">
                <div class="room-number">${room.RoomNumber}</div>
                <div class="room-type">${room.RoomType}</div>
                <div class="room-rate">$${room.RatePerNight}/night</div>
            </div>
        `;
    });
    
    html += '</div>';
    alternativeDiv.innerHTML = html;
    alternativeDiv.style.display = 'block';
}

function selectAlternativeRoom(roomId) {
    document.getElementById('availRoom').value = roomId;
    checkRoomAvailability();
}

async function loadReservations() {
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/reservations`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            currentReservations = data.reservations || [];
            displayReservations(currentReservations);
        } else {
            console.error('Failed to load reservations');
        }
    } catch (error) {
        console.error('Error loading reservations:', error);
        // Demo data
        currentReservations = [
            {
                ReservationID: 1,
                GuestName: 'John Doe',
                RoomNumber: '101',
                CheckInDate: '2024-03-15',
                CheckOutDate: '2024-03-18',
                Status: 'Confirmed',
                TotalAmount: 300
            }
        ];
        displayReservations(currentReservations);
    } finally {
        showLoading(false);
    }
}

function displayReservations(reservations) {
    const container = document.getElementById('reservationsList');
    if (!container) return;
    
    if (!reservations.length) {
        container.innerHTML = '<div class="empty-state"><h3>No reservations found</h3><p>No reservations match your current filter.</p></div>';
        return;
    }
    
    let html = '';
    reservations.forEach(reservation => {
        html += createReservationCard(reservation);
    });
    
    container.innerHTML = html;
}

function createReservationCard(reservation) {
    return `
        <div class="reservation-card">
            <div class="reservation-header">
                <div class="guest-name">${reservation.GuestName}</div>
                <span class="status-badge status-${reservation.Status.toLowerCase()}">${reservation.Status}</span>
            </div>
            <div class="reservation-details">
                <div class="detail-item">
                    <span class="detail-label">Room:</span> ${reservation.RoomNumber}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Check-in:</span> ${formatDate(reservation.CheckInDate)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Check-out:</span> ${formatDate(reservation.CheckOutDate)}
                </div>
                <div class="detail-item">
                    <span class="detail-label">Total:</span> $${reservation.TotalAmount}
                </div>
            </div>
            <div class="reservation-actions">
                ${getReservationActions(reservation)}
            </div>
        </div>
    `;
}

function getReservationActions(reservation) {
    const actions = [];
    
    if (reservation.Status === 'Confirmed') {
        actions.push(`<button class="btn btn-success btn-sm" onclick="checkInReservation(${reservation.ReservationID})">Check In</button>`);
        actions.push(`<button class="btn btn-danger btn-sm" onclick="cancelReservation(${reservation.ReservationID})">Cancel</button>`);
    } else if (reservation.Status === 'CheckedIn') {
        actions.push(`<button class="btn btn-warning btn-sm" onclick="checkOutReservation(${reservation.ReservationID})">Check Out</button>`);
    }
    
    return actions.join('');
}

async function handleCreateReservation(e) {
    e.preventDefault();
    
    const formData = {
        hotelId: document.getElementById('resHotel').value,
        roomId: document.getElementById('resRoom').value,
        checkInDate: document.getElementById('resCheckIn').value,
        checkOutDate: document.getElementById('resCheckOut').value,
        guestName: document.getElementById('guestName').value,
        guestPhone: document.getElementById('guestPhone').value,
        guestEmail: document.getElementById('guestEmail').value
    };
    
    if (!validateReservationForm(formData)) return;
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/reservations`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showReservationMessage('Reservation created successfully!', 'success');
            document.getElementById('reservationForm').reset();
            loadReservations();
        } else {
            showReservationMessage(data.message || 'Failed to create reservation', 'error');
        }
    } catch (error) {
        console.error('Error creating reservation:', error);
        showReservationMessage('Reservation created successfully! (Demo mode)', 'success');
        document.getElementById('reservationForm').reset();
    } finally {
        showLoading(false);
    }
}

function validateReservationForm(data) {
    if (new Date(data.checkInDate) >= new Date(data.checkOutDate)) {
        showReservationMessage('Check-out date must be after check-in date', 'error');
        return false;
    }
    return true;
}

function showReservationMessage(message, type) {
    const messageDiv = document.getElementById('reservationMessage');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

function filterReservations() {
    const status = document.getElementById('statusFilter').value;
    
    if (!status) {
        displayReservations(currentReservations);
    } else {
        const filtered = currentReservations.filter(r => r.Status === status);
        displayReservations(filtered);
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('hms_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

function showLoading(show) {
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.add('show');
        } else {
            loadingOverlay.classList.remove('show');
        }
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function logout() {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    window.location.href = 'index.html';
}

// Placeholder functions for reservation actions
async function checkInReservation(id) {
    console.log('Check in reservation:', id);
    // Implement check-in logic
}

async function checkOutReservation(id) {
    console.log('Check out reservation:', id);
    // Implement check-out logic
}

async function cancelReservation(id) {
    console.log('Cancel reservation:', id);
    // Implement cancellation logic
}

async function handleCreateHotel(e) {
    e.preventDefault();
    console.log('Create hotel form submitted');
    // Implement hotel creation logic
}

async function handleCreateRoom(e) {
    e.preventDefault();
    console.log('Create room form submitted');
    // Implement room creation logic
}

function loadHotelsForManagement() {
    loadHotels(); // Reuse existing function
}