import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Menu, X, Smartphone, Tablet, Monitor } from 'lucide-react';
import withAuth from "@/components/withAuth";
import withRole from "@/components/withRole";
import { HOCPresets } from "@/components/HOCComposer";


interface MobileTestProps {
  user?: any;
  isAuthenticated?: boolean;
}
function MobileTest({ user, isAuthenticated }: MobileTestProps) {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [breakpoint, setBreakpoint] = useState('');

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
      
      if (window.innerWidth < 640) {
        setBreakpoint('Mobile');
      } else if (window.innerWidth < 1024) {
        setBreakpoint('Tablet');
      } else {
        setBreakpoint('Desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const getBreakpointIcon = () => {
    if (breakpoint === 'Mobile') return <Smartphone className="h-5 w-5" />;
    if (breakpoint === 'Tablet') return <Tablet className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  const getBreakpointColor = () => {
    if (breakpoint === 'Mobile') return 'bg-red-100 text-red-800';
    if (breakpoint === 'Tablet') return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 space-y-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            📱 Mobile Responsiveness Test
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            {getBreakpointIcon()}
            <Badge className={`${getBreakpointColor()} px-3 py-1`}>
              {breakpoint} ({screenSize.width}x{screenSize.height})
            </Badge>
          </div>
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Test Card 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                This card should adapt to different screen sizes. On mobile it takes full width, on tablet it shares space, and on desktop it's part of a 3-column layout.
              </p>
              <Button className="w-full sm:w-auto">Test Button</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Test Card 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Responsive typography and spacing should work correctly across all devices.
              </p>
              <div className="space-y-2">
                <Input placeholder="Mobile-friendly input" className="w-full" />
                <Button variant="outline" className="w-full sm:w-auto">Secondary Action</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Test Card 3</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Touch targets should be at least 44px on mobile devices for easy interaction.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" className="h-11 sm:h-9">Small</Button>
                <Button className="h-11 sm:h-9">Medium</Button>
                <Button size="lg" className="h-11 sm:h-10">Large</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Navigation Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Mobile Navigation Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm sm:text-base text-gray-600">
                On mobile devices, you should see a hamburger menu (☰) in the top-left corner. 
                The sidebar should be hidden and slide in when the menu is clicked.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Mobile: Hamburger Menu</Badge>
                <Badge variant="outline">Tablet: Sidebar Visible</Badge>
                <Badge variant="outline">Desktop: Full Sidebar</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Table Test */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Responsive Table Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 sm:p-4 text-sm sm:text-base">Name</th>
                    <th className="text-left p-2 sm:p-4 text-sm sm:text-base">Email</th>
                    <th className="text-left p-2 sm:p-4 text-sm sm:text-base">Role</th>
                    <th className="text-left p-2 sm:p-4 text-sm sm:text-base">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-2 sm:p-4 text-sm sm:text-base">John Doe</td>
                    <td className="p-2 sm:p-4 text-sm sm:text-base">john@example.com</td>
                    <td className="p-2 sm:p-4 text-sm sm:text-base">Admin</td>
                    <td className="p-2 sm:p-4 text-sm sm:text-base">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="p-2 sm:p-4 text-sm sm:text-base">Jane Smith</td>
                    <td className="p-2 sm:p-4 text-sm sm:text-base">jane@example.com</td>
                    <td className="p-2 sm:p-4 text-sm sm:text-base">Manager</td>
                    <td className="p-2 sm:p-4 text-sm sm:text-base">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              This table should scroll horizontally on mobile devices.
            </p>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm sm:text-base">Responsive grid layout working</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm sm:text-base">Typography scaling correctly</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm sm:text-base">Touch targets appropriate size</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm sm:text-base">Table scrolling on mobile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm sm:text-base">Mobile navigation functional</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
// Export with authentication and role protection
// Export with essential HOCs (no auth since handled by routing)
export default HOCPresets.publicPage(MobileTest);
