// Authentication JavaScript for HMS Login Page

// API base URL
const API_BASE = '/api';

// DOM elements
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkExistingSession();
    setupEventListeners();
});

function setupEventListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function checkExistingSession() {
    // Check if user is already logged in
    const token = localStorage.getItem('hms_token');
    const user = localStorage.getItem('hms_user');
    
    if (token && user) {
        // Redirect to dashboard if already logged in
        window.location.href = 'dashboard.html';
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showMessage('Please enter both username and password', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            // Store authentication data
            console.log('Login response data:', data); // Debug log
            
            localStorage.setItem('hms_token', data.token || 'demo_token');
            localStorage.setItem('hms_user', JSON.stringify(data.user));
            
            console.log('Stored user data:', data.user); // Debug log
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } else {
            showMessage(data.message || 'Login failed. Please check your credentials.', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // Demo mode fallback for development
        if (isDemoCredentials(username, password)) {
            handleDemoLogin(username);
        } else {
            showMessage('Connection error. Please try again.', 'error');
        }
    } finally {
        showLoading(false);
    }
}

function isDemoCredentials(username, password) {
    const demoCredentials = [
        { username: 'admin', password: 'admin123', role: 'Admin' },
        { username: 'staff1', password: 'staff123', role: 'Staff' }
    ];
    
    return demoCredentials.some(cred => 
        cred.username === username && cred.password === password
    );
}

function handleDemoLogin(username) {
    const demoUser = {
        UserID: username === 'admin' ? 1 : 2,
        Username: username,
        Role: username === 'admin' ? 'Admin' : 'Staff',
        name: username === 'admin' ? 'Admin User' : 'Staff User'
    };
    
    console.log('Demo user created:', demoUser); // Debug log
    
    // Store demo authentication data
    localStorage.setItem('hms_token', 'demo_token');
    localStorage.setItem('hms_user', JSON.stringify(demoUser));
    
    showMessage('Demo login successful! Redirecting...', 'success');
    
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
}

function showMessage(message, type) {
    if (loginMessage) {
        loginMessage.textContent = message;
        loginMessage.className = `message ${type}`;
        loginMessage.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                loginMessage.style.display = 'none';
            }, 3000);
        }
    }
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

// Handle logout (called from dashboard)
function logout() {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    window.location.href = 'index.html';
}

// Export for use in other files
window.hmsAuth = {
    logout,
    checkAuth: () => {
        const token = localStorage.getItem('hms_token');
        const user = localStorage.getItem('hms_user');
        return token && user ? JSON.parse(user) : null;
    }
};