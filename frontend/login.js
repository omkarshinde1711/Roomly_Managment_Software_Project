// Login Page JavaScript for Hospitality Management System

// Global variables
let currentUser = null;

// API base URL
const API_BASE = '/api';

// DOM elements
const loginForm = document.getElementById('loginForm');
const loadingOverlay = document.getElementById('loadingOverlay');

// Initialize the login page
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
    setupLoginEventListeners();
});

function initializeLoginPage() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('hospitalityUser');
    if (savedUser) {
        // Redirect to dashboard if already logged in
        window.location.href = 'dashboard.html';
    }
    
    // Focus on username field
    document.getElementById('username').focus();
}

function setupLoginEventListeners() {
    // Login form submission
    loginForm.addEventListener('submit', handleLogin);
    
    // Enter key handling for better UX
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin(e);
        }
    });
}

// Authentication function
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!username || !password) {
        showMessage('loginMessage', 'Please enter both username and password', 'error');
        return;
    }
    
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
            
            // Save user info to localStorage for persistence
            localStorage.setItem('hospitalityUser', JSON.stringify(currentUser));
            
            // Show success message briefly
            showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        } else {
            showMessage('loginMessage', data.message || 'Invalid username or password', 'error');
            // Clear password field on failed login
            document.getElementById('password').value = '';
            document.getElementById('username').focus();
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('loginMessage', 'Connection error. Please check your internet connection and try again.', 'error');
    } finally {
        showLoading(false);
    }
}

// Utility functions
function showLoading(show) {
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

function showMessage(elementId, message, type = 'info') {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                messageElement.style.display = 'none';
            }, 3000);
        }
    }
}

function clearMessage(elementId) {
    const messageElement = document.getElementById(elementId);
    if (messageElement) {
        messageElement.style.display = 'none';
        messageElement.textContent = '';
    }
}

// Demo credential quick-fill (for development)
document.addEventListener('DOMContentLoaded', function() {
    const credentialItems = document.querySelectorAll('.credential-item');
    credentialItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.textContent;
            if (text.includes('admin / admin123')) {
                document.getElementById('username').value = 'admin';
                document.getElementById('password').value = 'admin123';
            } else if (text.includes('staff1 / staff123')) {
                document.getElementById('username').value = 'staff1';
                document.getElementById('password').value = 'staff123';
            }
        });
    });
});
