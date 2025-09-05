# Environment Variables Setup Guide

## Creating Your .env File

Create a `.env` file in your project root directory with the following variables:

```bash
# ===========================================
# TRAINING PORTAL FRONTEND - ENVIRONMENT VARIABLES
# ===========================================

# ===========================================
# API CONFIGURATION
# ===========================================
# Backend API URL - Change this to your production API URL
VITE_API_URL=http://localhost:7001

# WebSocket URL - Change this to your production WebSocket URL
VITE_WS_URL=ws://localhost:5000

# ===========================================
# APPLICATION CONFIGURATION
# ===========================================
# Application environment (development, staging, production)
VITE_APP_ENV=development

# Application name
VITE_APP_NAME=Training Portal

# Application version
VITE_APP_VERSION=1.0.0

# ===========================================
# SECURITY & AUTHENTICATION
# ===========================================
# JWT Secret (if needed for client-side validation)
# VITE_JWT_SECRET=your-jwt-secret-here

# Session timeout in minutes
VITE_SESSION_TIMEOUT=60

# ===========================================
# FEATURE FLAGS
# ===========================================
# Enable debug mode (shows console logs in development)
VITE_DEBUG_MODE=true

# Enable WebSocket real-time features
VITE_ENABLE_WEBSOCKET=true

# Enable chat notifications
VITE_ENABLE_CHAT_NOTIFICATIONS=true

# Enable email notifications
VITE_ENABLE_EMAIL_NOTIFICATIONS=false

# ===========================================
# EXTERNAL SERVICES
# ===========================================
# Email service configuration (if using external email service)
# VITE_EMAIL_SERVICE_URL=https://api.emailservice.com
# VITE_EMAIL_API_KEY=your-email-api-key

# File upload service (if using external file storage)
# VITE_FILE_UPLOAD_URL=https://api.filestorage.com
# VITE_FILE_UPLOAD_KEY=your-file-upload-key

# ===========================================
# ANALYTICS & MONITORING
# ===========================================
# Google Analytics ID (if using Google Analytics)
# VITE_GA_TRACKING_ID=GA-XXXXXXXXX

# Sentry DSN (if using Sentry for error tracking)
# VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# ===========================================
# DEVELOPMENT ONLY
# ===========================================
# Enable React DevTools in production (set to false for production)
VITE_ENABLE_DEVTOOLS=true

# Mock API responses (for development/testing)
VITE_MOCK_API=false

# ===========================================
# PRODUCTION OVERRIDES
# ===========================================
# Uncomment and modify these for production deployment
# VITE_API_URL=https://your-production-api.com
# VITE_WS_URL=wss://your-production-websocket.com
# VITE_APP_ENV=production
# VITE_DEBUG_MODE=false
# VITE_ENABLE_DEVTOOLS=false
```

## Important Notes

### 1. Security
- **Never commit your `.env` file to version control**
- Add `.env` to your `.gitignore` file
- Use different values for development, staging, and production

### 2. Vite Environment Variables
- All environment variables must be prefixed with `VITE_` to be accessible in your React app
- Variables without the `VITE_` prefix will not be available in the browser

### 3. Current Usage in Your Project
Your project currently uses these environment variables:
- `VITE_API_URL` - Used in multiple files for API calls
- `VITE_WS_URL` - Used in websocketService.ts for WebSocket connections
- `import.meta.env.MODE` - Used in AuthContext.tsx for development mode detection

### 4. Production Setup
For production deployment, make sure to:
1. Set `VITE_APP_ENV=production`
2. Set `VITE_DEBUG_MODE=false`
3. Update API URLs to your production endpoints
4. Remove or secure any development-only variables

### 5. Adding New Environment Variables
When adding new environment variables:
1. Add them to your `.env` file with the `VITE_` prefix
2. Access them in your code using `import.meta.env.VITE_YOUR_VARIABLE_NAME`
3. Update this documentation

## Example Usage in Code

```typescript
// Accessing environment variables
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:7001';
const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';
const appEnv = import.meta.env.VITE_APP_ENV;

// Conditional logic based on environment
if (import.meta.env.MODE === 'development') {
  console.log('Development mode');
}
```

## Environment-Specific Files

You can also create environment-specific files:
- `.env.development` - For development environment
- `.env.production` - For production environment
- `.env.local` - For local overrides (ignored by git)

These files will automatically be loaded by Vite based on the current mode.
