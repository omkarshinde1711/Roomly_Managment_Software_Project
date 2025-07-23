// Test the alternative rooms endpoint directly
const testAlternativeRoomsAPI = async () => {
    const API_BASE = 'http://localhost:3000/api';
    
    try {
        const response = await fetch(`${API_BASE}/rooms/available`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hotelId: 1,
                checkInDate: '2025-08-01',
                checkOutDate: '2025-08-04',
                roomType: null
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));
        
        if (response.ok) {
            const data = await response.json();
            console.log('Response data:', data);
        } else {
            const errorText = await response.text();
            console.log('Error response:', errorText);
        }
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

// For Node.js testing
if (typeof fetch === 'undefined') {
    console.log('Please test this in browser console or with a fetch polyfill');
} else {
    testAlternativeRoomsAPI();
}
