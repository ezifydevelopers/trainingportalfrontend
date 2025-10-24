import React from 'react';
import Layout from "@/components/Layout";
import HelpRequestsAdmin from "@/components/HelpRequestsAdmin";
import withAuth from "@/components/withAuth";
import withRole from "@/components/withRole";
import { HOCPresets } from "@/components/HOCComposer";


interface AdminHelpRequestsProps {
  user?: any;
  isAuthenticated?: boolean;
}
function AdminHelpRequests({ user, isAuthenticated }: AdminHelpRequestsProps) {
  return (
    <Layout>
      <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
        <HelpRequestsAdmin />
      </div>
    </Layout>
  );
}
// Export with authentication and role protection
// Export with essential HOCs (no auth since handled by routing)
export default HOCPresets.publicPage(AdminHelpRequests);
