import React, { memo } from 'react';
import { ArrowLeft, Plus, Search, Copy } from 'lucide-react';
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
  onShowDuplicateCompany?: () => void;
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
  onShowDuplicateCompany,
  isManagerView = false
}) => {
  if (selectedCompany) {
    return (
      <div className="w-full flex justify-center mb-4 sm:mb-6 lg:mb-8 pt-4 sm:pt-6 lg:pt-8 px-2 sm:px-4">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white w-full max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBackToCompanies} 
              className="text-white hover:bg-white/20 p-2 rounded-lg sm:rounded-xl w-fit"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Back to Companies</span>
            </Button>
            <div className="hidden sm:block w-px h-6 lg:h-8 bg-white/30"></div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 sm:mb-2 truncate">{selectedCompany.name}</h2>
              <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Training modules and assessments</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3">
            {onShowAddModule && (
              <Button 
                onClick={onShowAddModule}
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> 
                <span className="hidden sm:inline">Add Training Module</span>
                <span className="sm:hidden">Add Module</span>
              </Button>
            )}
            {onShowAddResource && (
              <Button 
                onClick={onShowAddResource}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" /> 
                <span className="hidden sm:inline">Add Resource Module</span>
                <span className="sm:hidden">Add Resource</span>
              </Button>
            )}
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center mb-4 sm:mb-6 lg:mb-8 pt-4 sm:pt-6 lg:pt-8 px-2 sm:px-4">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white w-full max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-1 sm:mb-2">Company Management</h1>
          <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Manage companies and their training modules</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4">
          <div className="relative">
            <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 sm:pl-10 w-full sm:w-64 bg-white/10 border-white/20 text-white placeholder:text-blue-200 focus:bg-white/20 text-sm sm:text-base h-9 sm:h-10"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            {!isManagerView && onShowNewCompany && (
              <Button 
                onClick={onShowNewCompany}
                className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create Company</span>
                <span className="sm:hidden">Create</span>
              </Button>
            )}
            {onShowDuplicateCompany && (
              <Button 
                onClick={onShowDuplicateCompany}
                className="bg-green-600 text-white hover:bg-green-700 font-medium px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3 rounded-lg sm:rounded-xl shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                <Copy className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Duplicate Data</span>
                <span className="sm:hidden">Duplicate</span>
              </Button>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
});

CompanyHeader.displayName = 'CompanyHeader';

export default CompanyHeader;
