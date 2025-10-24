
import Layout from "@/components/Layout";
import withAuth from "@/components/withAuth";
import { HOCPresets } from "@/components/HOCComposer";

interface SettingsProps {
  user?: any;
  isAuthenticated?: boolean;
}

function Settings({ user, isAuthenticated }: SettingsProps) {
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your account and application settings.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-600">Settings features will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
}

// Export with authentication (all authenticated users can access settings)
// Export with comprehensive HOC protection
export default HOCPresets.authPage(Settings);
