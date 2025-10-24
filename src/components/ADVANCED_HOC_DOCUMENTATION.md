# Advanced Higher-Order Components (HOCs) Documentation

## Overview

This project now includes a comprehensive set of Higher-Order Components (HOCs) for enhanced functionality, security, and user experience. All HOCs are designed to be composable and work together seamlessly.

## Available HOCs

### 1. **withAuth** - Authentication Protection
**Purpose**: Protects components that require authentication.

```tsx
import withAuth from '@/components/withAuth';

const MyComponent = ({ user, isAuthenticated }) => {
  // Component logic
};

export default withAuth(MyComponent);
```

**Features**:
- Automatic redirect to `/login` for unauthenticated users
- Passes `user` and `isAuthenticated` props
- Preserves original URL for post-login redirect

### 2. **withRole** - Role-Based Access Control
**Purpose**: Protects components that require specific user roles.

```tsx
import withRole from '@/components/withRole';

const AdminComponent = ({ user, isAuthenticated }) => {
  // Component logic
};

export default withRole(['ADMIN'], withAuth(AdminComponent));
```

**Features**:
- Role-based access control
- Redirects to `/unauthorized` for wrong roles
- Supports multiple roles: `['ADMIN', 'MANAGER']`

### 3. **withLoading** - Loading State Management
**Purpose**: Handles loading states with customizable UI.

```tsx
import withLoading from '@/components/withLoading';

const MyComponent = ({ isLoading, loadingText }) => {
  // Component logic
};

export default withLoading(MyComponent);
```

**Features**:
- Automatic loading spinner
- Customizable loading text
- Custom loading components support

### 4. **withErrorBoundary** - Error Handling
**Purpose**: Catches JavaScript errors and provides fallback UI.

```tsx
import withErrorBoundary from '@/components/withErrorBoundary';

const MyComponent = ({ onError }) => {
  // Component logic
};

export default withErrorBoundary(MyComponent);
```

**Features**:
- Catches all JavaScript errors
- Custom error fallback UI
- Development error details
- Retry and go home functionality

### 5. **withAnalytics** - Analytics Tracking
**Purpose**: Provides analytics tracking functionality.

```tsx
import withAnalytics from '@/components/withAnalytics';

const MyComponent = ({ trackEvent, trackPageView }) => {
  // Component logic
  const handleClick = () => {
    trackEvent({
      action: 'click',
      category: 'button',
      label: 'submit'
    });
  };
};

export default withAnalytics(MyComponent);
```

**Features**:
- Automatic page view tracking
- Event tracking with custom data
- Development mode logging

### 6. **withNotifications** - Notification System
**Purpose**: Provides toast notifications and notification management.

```tsx
import withNotifications from '@/components/withNotifications';

const MyComponent = ({ showSuccess, showError, showWarning, showInfo }) => {
  // Component logic
  const handleSuccess = () => {
    showSuccess('Operation completed!');
  };
};

export default withNotifications(MyComponent);
```

**Features**:
- Toast notifications (success, error, warning, info)
- Notification state management
- Auto-dismiss functionality

## HOC Composition with HOCComposer

### **HOCComposer** - Advanced HOC Combination
**Purpose**: Easily combine multiple HOCs with a clean API.

```tsx
import { HOCComposer } from '@/components/HOCComposer';

const MyComponent = () => {
  // Component logic
};

export default HOCComposer(MyComponent, {
  requireAuth: true,
  allowedRoles: ['ADMIN'],
  withErrorBoundary: true,
  withAnalytics: true,
  withNotifications: true,
  withLoading: true,
});
```

### **HOC Presets** - Pre-configured Combinations

#### **Admin Pages**
```tsx
import { HOCPresets } from '@/components/HOCComposer';

export default HOCPresets.adminPage(MyComponent);
```
**Includes**: Auth + Role (ADMIN) + Error Boundary + Analytics + Notifications + Loading

#### **Manager Pages**
```tsx
export default HOCPresets.managerPage(MyComponent);
```
**Includes**: Auth + Role (ADMIN, MANAGER) + Error Boundary + Analytics + Notifications + Loading

#### **Trainee Pages**
```tsx
export default HOCPresets.traineePage(MyComponent);
```
**Includes**: Auth + Role (TRAINEE) + Error Boundary + Analytics + Notifications + Loading

#### **Data Pages**
```tsx
export default HOCPresets.dataPage(MyComponent);
```
**Includes**: Auth + Error Boundary + Analytics + Loading

#### **Public Pages**
```tsx
export default HOCPresets.publicPage(MyComponent);
```
**Includes**: Error Boundary + Analytics + Notifications

#### **Simple Auth Pages**
```tsx
export default HOCPresets.authPage(MyComponent);
```
**Includes**: Auth + Error Boundary

## Current Implementation Status

### **Pages Using Advanced HOCs:**

#### **Admin Pages (9 pages)**
- `AdminCompanyModules.tsx` ✅
- `AdminPanel.tsx` ✅
- `UserManagement.tsx` ✅
- `AdminHelpRequests.tsx` ✅
- `PendingTrainees.tsx` ✅
- `MobileTest.tsx` ✅
- `EmailMarketing.tsx` ✅
- `DataManagement.tsx` ✅
- `AdminFeedback.tsx` ✅

#### **Manager Pages (7 pages)**
- `Dashboard.tsx` ✅
- `TrackTraineeDetail.tsx` ✅
- `TrackTrainee.tsx` ✅
- `TimeTrackingDashboard.tsx` ✅
- `Reports.tsx` ✅
- `Messages.tsx` ✅
- `ContactDetails.tsx` ✅

#### **Trainee Pages (3 pages)**
- `TrainingModule.tsx` ✅
- `TraineeDashboard.tsx` ✅
- `TrainingProgress.tsx` ✅

#### **Special Pages (2 pages)**
- `Chat.tsx` (Data Page) ✅
- `Settings.tsx` (Auth Page) ✅

## HOC Benefits

### **🔒 Security**
- **Authentication Protection**: All pages require login
- **Role-Based Access**: Proper role restrictions
- **Error Boundaries**: Graceful error handling

### **⚡ Performance**
- **Loading States**: Better user experience
- **Optimized Renders**: No unnecessary re-renders
- **Error Recovery**: Automatic error handling

### **📊 Analytics**
- **Page Tracking**: Automatic page view tracking
- **Event Tracking**: User interaction analytics
- **Development Logging**: Debug-friendly logging

### **🎨 User Experience**
- **Notifications**: Toast notifications for feedback
- **Loading States**: Visual feedback during operations

### **🛠️ Developer Experience**
- **Composable**: Easy to combine multiple HOCs
- **Presets**: Pre-configured combinations
- **TypeScript**: Full type safety
- **Debugging**: Clear display names

## Best Practices

### **1. Use Presets When Possible**
```tsx
// ✅ Good - Use presets
export default HOCPresets.adminPage(MyComponent);

// ❌ Avoid - Manual composition
export default withRole(['ADMIN'], withAuth(withErrorBoundary(MyComponent)));
```

### **2. Order Matters**
HOCs are applied in this order (outermost to innermost):
1. Error Boundary
2. Analytics
4. Notifications
5. Loading
6. Role-based Access
7. Authentication

### **3. Props Management**
```tsx
interface MyComponentProps {
  // HOC props
  user?: any;
  isAuthenticated?: boolean;
  isLoading?: boolean;
  showSuccess?: (title: string, message?: string) => void;
  trackEvent?: (event: AnalyticsEvent) => void;
  
  // Your component props
  myProp: string;
}
```

### **4. Error Handling**
```tsx
const MyComponent = ({ onError }) => {
  useEffect(() => {
    try {
      // Risky operation
    } catch (error) {
      onError?.(error, errorInfo);
    }
  }, []);
};
```

## Current HOC Count

- **Basic HOCs**: 2 (withAuth, withRole)
- **Advanced HOCs**: 4 (withLoading, withErrorBoundary, withAnalytics, withNotifications)
- **Composition Utilities**: 1 (HOCComposer)
- **Total HOCs**: 8

**Status**: ✅ Well within recommended limits (100-120 max)

## Future Enhancements

Potential additional HOCs:
- `withPermissions` - Granular permission system
- `withCaching` - Data caching and persistence
- `withValidation` - Form validation
- `withPagination` - Pagination management
- `withSearch` - Search functionality
- `withFilters` - Data filtering

Your training portal now has enterprise-level HOC architecture! 🎉
