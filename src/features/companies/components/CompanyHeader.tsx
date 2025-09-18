import React, { memo } from 'react';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Company } from '@/shared/types/common.types';

interface CompanyHeaderProps {
  selectedCompany: Company | null;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onBackToCompanies: () => void;
  onShowNewCompany?: () => void;
  onShowAddModule?: () => void;
  onShowAddResource?: () => void;
  isManagerView?: boolean;
}

const CompanyHeader = memo<CompanyHeaderProps>(({
  selectedCompany,
  searchTerm,
  onSearchChange,
  onBackToCompanies,
  onShowNewCompany,
  onShowAddModule,
  onShowAddResource,
  isManagerView = false
}) => {
  if (selectedCompany) {
    return (
      <div className="w-full flex justify-center mb-8 pt-8">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white" style={{ width: '1280px' }}>
          <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBackToCompanies} 
              className="text-white hover:bg-white/20 p-2 rounded-xl"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Companies
            </Button>
            <div className="w-px h-8 bg-white/30"></div>
            <div>
              <h2 className="text-4xl font-bold mb-2">{selectedCompany.name}</h2>
              <p className="text-blue-100 text-lg">Training modules and assessments</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {onShowAddModule && (
              <Button 
                onClick={onShowAddModule}
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-xl shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" /> 
                Add Training Module
              </Button>
            )}
            {onShowAddResource && (
              <Button 
                onClick={onShowAddResource}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-xl shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" /> 
                Add Resource Module
              </Button>
            )}
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center mb-8 pt-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white" style={{ width: '1280px' }}>
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Company Management</h1>
          <p className="text-blue-100 text-lg">Manage companies and their training modules</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20"
            />
          </div>
          {!isManagerView && onShowNewCompany && (
            <Button 
              onClick={onShowNewCompany}
              className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-6 py-3 rounded-xl shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Company
            </Button>
          )}
        </div>
        </div>
      </div>
    </div>
  );
});

CompanyHeader.displayName = 'CompanyHeader';

export default CompanyHeader;
