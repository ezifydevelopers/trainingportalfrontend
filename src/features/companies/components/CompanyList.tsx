import React, { memo } from 'react';
import CompanyCard from './CompanyCard';
import { Company } from '@/shared/types/common.types';

interface CompanyListProps {
  companies: Company[];
  onCompanySelect: (company: Company) => void;
  onCompanyEdit: (company: Company) => void;
  onCompanyDelete: (company: Company) => void;
  isLoading?: boolean;
  searchTerm?: string;
}

const CompanyList = memo<CompanyListProps>(({ 
  companies, 
  onCompanySelect, 
  onCompanyEdit, 
  onCompanyDelete,
  isLoading = false,
  searchTerm = ''
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading companies...</div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">
          {searchTerm ? 'No companies found matching your search.' : 'No companies available.'}
        </div>
        {searchTerm && (
          <div className="text-sm text-gray-400">
            Try adjusting your search terms or create a new company.
          </div>
        )}
      </div>
    );
  }

  // Use a responsive grid layout instead of react-window
  // This provides better performance for typical company lists and avoids the FixedSizeGrid issue
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          onSelect={onCompanySelect}
          onEdit={onCompanyEdit}
          onDelete={onCompanyDelete}
        />
      ))}
    </div>
  );
});

CompanyList.displayName = 'CompanyList';

export default CompanyList;