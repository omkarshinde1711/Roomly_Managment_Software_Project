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
        
        // Check if user data has the correct fields
        if (!currentUser.UserID && currentUser.userID) {
            // Migrate old user data format
            console.log('Migrating old user data format');
            currentUser.UserID = currentUser.userID;
            currentUser.Username = currentUser.username || currentUser.Username;
            currentUser.Role = currentUser.role || currentUser.Role;
            localStorage.setItem('hms_user', JSON.stringify(currentUser));
        }
        
        updateUserDisplay();
        
        // Show management tab for admin users
        if (currentUser.Role === 'Admin') {
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
        const displayName = currentUser.name || currentUser.Username || 'User';
        
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
            { HotelID: 1, HotelName: 'Grand Plaza Hotel', Address: '123 Main St' },
            { HotelID: 2, HotelName: 'Ocean View Resort', Address: '456 Beach Rd' }
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
                option.textContent = hotel.HotelName || hotel.Name; // Check both possible field names
                select.appendChild(option);
            });
        }
    });
}

async function updateRoomsList() {
    const hotelId = document.getElementById('availHotel').value;
    const roomSelect = document.getElementById('availRoom');
    
    console.log('Updating rooms list for hotel:', hotelId);
    
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
            console.log('Rooms loaded:', data);
            populateRoomSelect(roomSelect, data.rooms || []);
        } else {
            console.error('Failed to load rooms - response not ok');
            // Fallback to demo data
            const demoRooms = [
                { RoomID: 1, RoomNumber: '101', RoomType: 'Single', RatePerNight: 100 },
                { RoomID: 2, RoomNumber: '102', RoomType: 'Double', RatePerNight: 150 }
            ];
            populateRoomSelect(roomSelect, demoRooms);
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
        option.textContent = `${room.RoomNumber} - ${room.RoomType} (₹${room.RatePerNight}/night)`;
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
    
    console.log('Availability check inputs:', { hotelId, roomId, checkIn, checkOut });
    
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
        console.log('Availability response:', data);
        
        if (response.ok && data.success) {
            showAvailabilityResult(
                data.available ? 'Room is available!' : 'Room is not available for selected dates',
                data.available
            );
            
            // If room is not available, fetch alternative rooms
            if (!data.available) {
                await fetchAlternativeRooms(hotelId, checkIn, checkOut);
            } else {
                // Clear any previous alternatives if room is available
                const alternativesDiv = document.getElementById('alternativeRooms');
                if (alternativesDiv) {
                    alternativesDiv.innerHTML = '';
                }
            }
        } else {
            console.error('Availability check failed:', data);
            showAvailabilityResult(data.message || 'Error checking availability', false);
        }
    } catch (error) {
        console.error('Error checking availability:', error);
        showAvailabilityResult('Network error - please try again', false);
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

async function fetchAlternativeRooms(hotelId, checkInDate, checkOutDate) {
    try {
        console.log('Fetching alternatives for:', { hotelId, checkInDate, checkOutDate });
        
        const response = await fetch(`${API_BASE}/rooms/available`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                hotelId,
                checkInDate,
                checkOutDate,
                roomType: null // Get all room types
            })
        });
        
        console.log('Alternative rooms response status:', response.status);
        console.log('Alternative rooms response headers:', response.headers.get('content-type'));
        
        // Get response text first to debug
        const responseText = await response.text();
        console.log('Raw response text:', responseText);
        
        if (!response.ok) {
            console.error('Response not OK:', response.status, response.statusText);
            console.error('Error response body:', responseText);
            showNoAlternatives();
            return;
        }
        
        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.error('Response was not valid JSON:', responseText);
            showNoAlternatives();
            return;
        }
        
        console.log('Alternative rooms response:', data);
        
        if (data.success && data.rooms && data.rooms.length > 0) {
            showAlternativeRooms(data.rooms);
        } else {
            showNoAlternatives();
        }
    } catch (error) {
        console.error('Error fetching alternative rooms:', error);
        showNoAlternatives();
    }
}

function showAlternativeRooms(rooms) {
    const alternativeDiv = document.getElementById('alternativeRooms');
    if (!alternativeDiv) return;
    
    let html = '<div class="alternatives-section">';
    html += '<h3>Alternative Available Rooms</h3>';
    html += '<div class="room-grid">';
    
    rooms.forEach(room => {
        html += `
            <div class="room-card" onclick="selectAlternativeRoom(${room.RoomID}, '${room.RoomNumber}')">
                <div class="room-header">
                    <div class="room-number">Room ${room.RoomNumber}</div>
                    <div class="room-type">${room.RoomType}</div>
                </div>
                <div class="room-details">
                    <div class="room-rate">₹${Number(room.RatePerNight).toFixed(2)}/night</div>
                    <div class="room-capacity">Max: ${room.MaxOccupancy} guests</div>
                    <div class="hotel-name">${room.HotelName}</div>
                </div>
                <button class="btn btn-sm btn-primary">Select This Room</button>
            </div>
        `;
    });
    
    html += '</div></div>';
    alternativeDiv.innerHTML = html;
    alternativeDiv.style.display = 'block';
}

function showNoAlternatives() {
    const alternativeDiv = document.getElementById('alternativeRooms');
    if (alternativeDiv) {
        alternativeDiv.innerHTML = '<div class="no-alternatives">No alternative rooms available for these dates.</div>';
        alternativeDiv.style.display = 'block';
    }
}

function selectAlternativeRoom(roomId, roomNumber) {
    // Update the room selection
    document.getElementById('availRoom').value = roomId;
    
    // Show confirmation message
    showAvailabilityResult(`Selected alternative room: ${roomNumber} - This room is available!`, true);
    
    // Hide alternatives
    const alternativeDiv = document.getElementById('alternativeRooms');
    if (alternativeDiv) {
        alternativeDiv.style.display = 'none';
    }
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
    const statusClass = reservation.Status.toLowerCase();
    
    return `
        <div class="reservation-card-modern">
            <div class="reservation-card-header">
                <div class="guest-info">
                    <h3 class="guest-name">${reservation.GuestName}</h3>
                    <p class="guest-phone">${reservation.GuestPhone}</p>
                </div>
                <span class="status-badge-modern status-${statusClass}">${reservation.Status}</span>
            </div>
            
            <div class="hotel-location">
                <span class="hotel-name">${reservation.HotelName || 'N/A'}</span>
            </div>
            
            <div class="reservation-details-grid">
                <div class="detail-card">
                    <div class="detail-content">
                        <span class="detail-label">Room</span>
                        <span class="detail-value">${reservation.RoomNumber}</span>
                    </div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-content">
                        <span class="detail-label">Check-in</span>
                        <span class="detail-value">${formatDate(reservation.CheckInDate)}</span>
                    </div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-content">
                        <span class="detail-label">Check-out</span>
                        <span class="detail-value">${formatDate(reservation.CheckOutDate)}</span>
                    </div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-content">
                        <span class="detail-label">Rate</span>
                        <span class="detail-value">₹${reservation.RatePerNight ? Number(reservation.RatePerNight).toFixed(2) : 'N/A'}/night</span>
                    </div>
                </div>
                
                <div class="detail-card">
                    <div class="detail-content">
                        <span class="detail-label">Nights</span>
                        <span class="detail-value">${reservation.NumberOfNights || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="detail-card total-card">
                    <div class="detail-content">
                        <span class="detail-label">Total</span>
                        <span class="detail-value total-amount">₹${reservation.TotalAmount ? Number(reservation.TotalAmount).toFixed(2) : 'Calculating...'}</span>
                    </div>
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
    } else if (reservation.Status === 'CheckedOut') {
        actions.push(`<button class="btn btn-info btn-sm" onclick="viewBill(${reservation.ReservationID})">View Bill</button>`);
    }
    
    return actions.join('');
}

async function handleCreateReservation(e) {
    e.preventDefault();
    
    // Get current user info
    const currentUser = JSON.parse(localStorage.getItem('hms_user') || '{}');
    console.log('Current user for reservation:', currentUser); // Debug log
    
    if (!currentUser.UserID) {
        console.log('Authentication failed - no UserID found'); // Debug log
        showReservationMessage('User authentication error. Please login again.', 'error');
        return;
    }
    
    const formData = {
        userId: currentUser.UserID,
        roomId: document.getElementById('resRoom').value,
        checkInDate: document.getElementById('resCheckIn').value,
        checkOutDate: document.getElementById('resCheckOut').value,
        guestName: document.getElementById('guestName').value,
        guestPhone: document.getElementById('guestPhone').value,
        guestEmail: document.getElementById('guestEmail').value
    };
    
    console.log('Form data for reservation:', formData); // Debug log
    
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
    if (!data.userId) {
        showReservationMessage('User authentication error', 'error');
        return false;
    }
    if (!data.roomId) {
        showReservationMessage('Please select a room', 'error');
        return false;
    }
    if (!data.guestName) {
        showReservationMessage('Guest name is required', 'error');
        return false;
    }
    if (!data.checkInDate || !data.checkOutDate) {
        showReservationMessage('Check-in and check-out dates are required', 'error');
        return false;
    }
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

// Reservation action functions
async function checkInReservation(id) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/checkin/${id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Guest checked in successfully!');
            loadReservations(); // Refresh the reservations list
        } else {
            alert('Error checking in: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Check in error:', error);
        alert('Error checking in guest. Please try again.');
    }
}

async function checkOutReservation(id) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/checkout/${id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            let message = 'Guest checked out successfully!';
            if (data.bill && data.bill.TotalAmount) {
                message += `\n\nBill Generated:\nTotal Amount: $${data.bill.TotalAmount}\nBill ID: ${data.bill.BillID}`;
            }
            alert(message);
            loadReservations(); // Refresh the reservations list
        } else {
            alert('Error checking out: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Check out error:', error);
        alert('Error checking out guest. Please try again.');
    }
}

async function cancelReservation(id) {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/reservations/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Reservation cancelled successfully!');
            loadReservations(); // Refresh the reservations list
        } else {
            alert('Error cancelling reservation: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Cancel reservation error:', error);
        alert('Error cancelling reservation. Please try again.');
    }
}

async function viewBill(reservationId) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`/api/bills/${reservationId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.bill) {
            const bill = data.bill;
            const billDetails = `
Bill Details
============
Bill ID: ${bill.BillID}
Reservation ID: ${bill.ReservationID}
Total Amount: $${bill.TotalAmount}
Payment Status: ${bill.PaymentStatus}
Created Date: ${new Date(bill.CreatedDate).toLocaleDateString()}
            `.trim();
            
            alert(billDetails);
        } else {
            alert('Error retrieving bill: ' + (data.message || 'Bill not found'));
        }
    } catch (error) {
        console.error('View bill error:', error);
        alert('Error retrieving bill. Please try again.');
    }
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