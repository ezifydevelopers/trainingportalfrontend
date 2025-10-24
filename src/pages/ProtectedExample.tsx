import React from 'react';
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HOCPresets } from "@/components/HOCComposer";

interface ProtectedExampleProps {
  user?: any;
  isAuthenticated?: boolean;
}

/**
 * Example page demonstrating withAuth and withRole HOCs
 * This page is protected and requires authentication
 */
function ProtectedExample({ user, isAuthenticated }: ProtectedExampleProps) {
  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔒 Protected Page Example
              <Badge variant="secondary">withAuth HOC</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">✅ Authentication Status</h3>
              <p className="text-green-700">
                This page is protected by the <code className="bg-green-100 px-1 rounded">withAuth</code> HOC.
                Only authenticated users can access this page.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">👤 User Information</h3>
              <div className="text-blue-700 space-y-1">
                <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
                <p><strong>Role:</strong> {user?.role || 'N/A'}</p>
                <p><strong>Email:</strong> {user?.email || 'N/A'}</p>
                <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-2">🔧 HOC Implementation</h3>
              <div className="text-yellow-700">
                <p className="mb-2">This page demonstrates:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Authentication protection with <code className="bg-yellow-100 px-1 rounded">withAuth</code></li>
                  <li>Role-based access control with <code className="bg-yellow-100 px-1 rounded">withRole</code></li>
                  <li>Automatic redirect to login for unauthenticated users</li>
                  <li>User data passed as props to the component</li>
                </ul>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">📝 Code Example</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`// Export with authentication and role protection
export default withRole(['ADMIN', 'MANAGER'], withAuth(ProtectedExample));

// The HOC automatically:
// 1. Checks if user is authenticated
// 2. Redirects to /login if not authenticated
// 3. Checks if user has required role
// 4. Redirects to /unauthorized if role doesn't match
// 5. Passes user and isAuthenticated as props`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

// Export with comprehensive HOC protection (ADMIN and MANAGER only)
export default HOCPresets.managerPage(ProtectedExample);
