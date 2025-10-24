# Higher-Order Components (HOCs) Documentation

## Overview

This project implements Higher-Order Components (HOCs) for authentication and authorization. HOCs are functions that take a component and return a new component with additional functionality.

## Available HOCs

### 1. withAuth

**Purpose**: Protects components that require authentication.

**Usage**:
```tsx
import withAuth from '@/components/withAuth';

const MyComponent = ({ user, isAuthenticated }) => {
  // Component logic
};

export default withAuth(MyComponent);
```

**Features**:
- Automatically redirects unauthenticated users to `/login`
- Passes `user` and `isAuthenticated` props to wrapped component
- Preserves the original URL in `state.from` for post-login redirect

### 2. withRole

**Purpose**: Protects components that require specific user roles.

**Usage**:
```tsx
import withRole from '@/components/withRole';

const AdminComponent = ({ user, isAuthenticated }) => {
  // Component logic
};

export default withRole(['ADMIN'], withAuth(AdminComponent));
```

**Features**:
- Checks if user has required role(s)
- Redirects to `/unauthorized` if role doesn't match
- Should be used in combination with `withAuth`

## Implementation Examples

### Basic Authentication
```tsx
// pages/Profile.tsx
import withAuth from '@/components/withAuth';

function Profile({ user, isAuthenticated }) {
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
    </div>
  );
}

export default withAuth(Profile);
```

### Role-Based Access Control
```tsx
// pages/AdminPanel.tsx
import withAuth from '@/components/withAuth';
import withRole from '@/components/withRole';

function AdminPanel({ user, isAuthenticated }) {
  return (
    <div>
      <h1>Admin Panel</h1>
      <p>Only admins can see this</p>
    </div>
  );
}

export default withRole(['ADMIN'], withAuth(AdminPanel));
```

### Multiple Role Access
```tsx
// pages/ManagerDashboard.tsx
import withAuth from '@/components/withAuth';
import withRole from '@/components/withRole';

function ManagerDashboard({ user, isAuthenticated }) {
  return (
    <div>
      <h1>Manager Dashboard</h1>
      <p>Admins and Managers can see this</p>
    </div>
  );
}

export default withRole(['ADMIN', 'MANAGER'], withAuth(ManagerDashboard));
```

## HOC Composition

HOCs can be composed together for complex protection scenarios:

```tsx
// Most restrictive to least restrictive
export default withRole(['ADMIN'], withAuth(AdminOnlyComponent));
export default withRole(['ADMIN', 'MANAGER'], withAuth(ManagerComponent));
export default withAuth(AnyAuthenticatedUserComponent);
```

## Props Passed to Wrapped Components

Both HOCs pass the following props to wrapped components:

- `user`: The authenticated user object
- `isAuthenticated`: Boolean indicating authentication status

## Redirect Behavior

### withAuth
- **Unauthenticated**: Redirects to `/login`
- **Authenticated**: Renders the wrapped component

### withRole
- **Unauthenticated**: Redirects to `/login`
- **Wrong Role**: Redirects to `/unauthorized`
- **Correct Role**: Renders the wrapped component

## Best Practices

1. **Always use withAuth before withRole**:
   ```tsx
   // ✅ Correct
   export default withRole(['ADMIN'], withAuth(Component));
   
   // ❌ Incorrect
   export default withAuth(withRole(['ADMIN'], Component));
   ```

2. **Use specific roles when possible**:
   ```tsx
   // ✅ Specific
   export default withRole(['ADMIN'], withAuth(Component));
   
   // ❌ Too broad
   export default withRole(['ADMIN', 'MANAGER', 'TRAINEE'], withAuth(Component));
   ```

3. **Combine with Layout component**:
   ```tsx
   function MyPage({ user, isAuthenticated }) {
     return (
       <Layout>
         <div>Protected content</div>
       </Layout>
     );
   }
   ```

## Current Implementation Status

### Pages Using withAuth HOC:
- ✅ `TrainingModule.tsx` - TRAINEE role
- ✅ `AdminCompanyModules.tsx` - ADMIN role
- ✅ `Dashboard.tsx` - ADMIN, MANAGER roles
- ✅ `ProtectedExample.tsx` - ADMIN, MANAGER roles (demo)

### Available User Roles:
- `ADMIN` - Full system access
- `MANAGER` - Company management access
- `TRAINEE` - Training module access

## Testing

To test the HOCs:

1. **Authentication Test**:
   - Log out and try to access protected pages
   - Should redirect to `/login`

2. **Role Test**:
   - Login as TRAINEE and try to access ADMIN pages
   - Should redirect to `/unauthorized`

3. **Success Test**:
   - Login with correct role and access protected pages
   - Should render the component with user props

## Future Enhancements

Potential additional HOCs:
- `withLoading` - Loading state management
- `withErrorBoundary` - Error handling
- `withAnalytics` - Analytics tracking
- `withTheme` - Theme management
