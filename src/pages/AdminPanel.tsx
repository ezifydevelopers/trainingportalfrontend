
import Layout from "@/components/Layout";

export default function AdminPanel() {
  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-600 mt-1">System administration controls.</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
          <p className="text-gray-600">Admin features will be implemented here.</p>
          <a
            href="/admin/company-modules"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Manage Company Training Modules
          </a>
        </div>
      </div>
    </Layout>
  );
}
