# Frontend Structure - HMS

## File Organization

```
frontend/
├── index.html          # Homepage/Landing page with login
├── dashboard.html      # Main dashboard (protected, post-login)
├── auth.js            # Authentication logic
├── dashboard.js       # Dashboard functionality
├── script.js          # Shared utilities
├── styles.css         # All styling (clean minimal theme)
├── DESIGN.md          # Design documentation
└── assets/            # Static assets
```

## Page Flow

1. **Homepage (`index.html`)**
   - Clean landing page with hero section
   - Login form for staff authentication
   - Demo credentials display
   - Uses `auth.js` for login logic
   - Redirects to `dashboard.html` on successful login

2. **Dashboard (`dashboard.html`)**
   - Protected page (requires authentication)
   - Main application interface
   - Tabbed navigation for different features
   - Uses `dashboard.js` for functionality
   - Redirects to `index.html` on logout

## Authentication Flow

1. User visits `index.html`
2. `auth.js` checks for existing session
3. If authenticated, redirect to `dashboard.html`
4. If not authenticated, show login form
5. On successful login, store token and redirect to dashboard
6. Dashboard checks authentication on load
7. Logout clears session and redirects to homepage

## Features by Page

### Homepage (`index.html`)
- Hero section with system features
- Clean login interface
- Demo credentials
- Loading states

### Dashboard (`dashboard.html`)
- **Reservations Tab**: View and manage current bookings
- **Check Availability Tab**: Real-time room availability checking
- **New Booking Tab**: Create new reservations
- **Management Tab**: Hotel and room administration (Admin only)

## Styling

- Clean, minimal white theme
- Consistent spacing and typography
- Responsive design
- Subtle hover effects
- Professional appearance

## Usage

1. Start the backend server
2. Open `index.html` in a browser
3. Use demo credentials to login:
   - **Admin**: admin / admin123
   - **Staff**: staff1 / staff123
4. Navigate through dashboard features
5. Logout to return to homepage

## Development Notes

- All authentication is handled client-side for demo purposes
- Real implementation should use JWT tokens
- Backend API integration ready
- Error handling for network issues
- Graceful fallbacks for offline mode
