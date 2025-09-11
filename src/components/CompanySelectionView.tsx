import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { Company } from '@/types/contact';

interface CompanySelectionViewProps {
  companies: Company[];
  isLoading: boolean;
  onCompanySelect: (company: Company) => void;
  onNewCompany: () => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (company: Company) => void;
  onManageModules: (company: Company) => void;
  getLogoUrl: (logo: string) => string;
  getInitials: (name: string) => string;
}

export default function CompanySelectionView({
  companies,
  isLoading,
  onCompanySelect,
  onNewCompany,
  onEditCompany,
  onDeleteCompany,
  onManageModules,
  getLogoUrl,
  getInitials
}: CompanySelectionViewProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading companies...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-2">Company Training Modules</h2>
              <p className="text-blue-100 text-lg">Manage training content and assessments for your companies</p>
            </div>
          </div>
          <Button 
            onClick={onNewCompany} 
            className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-xl shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Company
          </Button>
        </div>
      </div>

      {/* Company Selection Section */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border-0">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Select a Company</h3>
          <p className="text-gray-600 text-lg">Choose a company to manage their training modules and resources</p>
        </div>

        {/* Company Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ scrollBehavior: 'smooth' }}>
          {companies.map((company) => (
            <div key={company.id} className="relative">
              <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden transform hover:-translate-y-1">
                {/* Company Logo/Avatar */}
                <div className="h-32 w-full flex items-center justify-center overflow-hidden relative border-b border-gray-100">
                  {company.logoUrl ? (
                    <img 
                      src={getLogoUrl(company.logoUrl)} 
                      alt={`${company.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {getInitials(company.name)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Company Info */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{company.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">Click to manage training modules</p>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEditCompany(company);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors z-10 relative"
                        title="Edit Company"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDeleteCompany(company);
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors z-10 relative"
                        title="Delete Company"
                      >
                        Delete
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onManageModules(company);
                      }}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1 z-10 relative"
                      title="Manage Modules"
                    >
                      <span>Manage</span>
                      <span>←</span>
                    </button>
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
