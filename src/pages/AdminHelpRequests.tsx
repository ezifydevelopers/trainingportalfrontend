import React from 'react';
import Layout from "@/components/Layout";
import HelpRequestsAdmin from "@/components/HelpRequestsAdmin";

export default function AdminHelpRequests() {
  return (
    <Layout>
      <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        <HelpRequestsAdmin />
      </div>
    </Layout>
  );
} 