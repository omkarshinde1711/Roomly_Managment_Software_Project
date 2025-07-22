// Shared utilities for HMS application

// Common constants
const API_BASE = '/api';

// Utility functions
const utils = {
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString();
    },
    
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },
    
    showMessage: (elementId, message, type) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.className = `message ${type}`;
            element.style.display = 'block';
            
            if (type === 'success') {
                setTimeout(() => {
                    element.style.display = 'none';
                }, 3000);
            }
        }
    },
    
    showLoading: (show, overlayId = 'loadingOverlay') => {
        const overlay = document.getElementById(overlayId);
        if (overlay) {
            if (show) {
                overlay.classList.add('show');
            } else {
                overlay.classList.remove('show');
            }
        }
    },
    
    validateDates: (checkIn, checkOut) => {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (checkInDate < today) {
            return { valid: false, message: 'Check-in date cannot be in the past' };
        }
        
        if (checkInDate >= checkOutDate) {
            return { valid: false, message: 'Check-out date must be after check-in date' };
        }
        
        return { valid: true };
    },
    
    setMinDates: () => {
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('input[type="date"]');
        dateInputs.forEach(input => {
            input.min = today;
        });
    }
};

// Make utilities available globally
window.hmsUtils = utils;

// Common initialization for date inputs
document.addEventListener('DOMContentLoaded', function() {
    utils.setMinDates();
});
