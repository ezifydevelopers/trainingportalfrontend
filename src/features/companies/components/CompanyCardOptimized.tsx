import React, { memo } from 'react';
import { ArrowLeft, Edit, Trash } from 'lucide-react';
import { getImageUrl } from '@/shared/utils/imageUtils';
import { Company } from '@/shared/types/common.types';

interface CompanyCardOptimizedProps {
  company: Company;
  onSelect: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

const CompanyCardOptimized = memo<CompanyCardOptimizedProps>(({ 
  company, 
  onSelect, 
  onEdit, 
  onDelete 
}) => {
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(company);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(company);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(company);
  };

  return (
    <div className="relative">
      <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 overflow-hidden transform hover:-translate-y-1">
        {/* Company Logo/Avatar */}
        <div className="h-32 w-full flex items-center justify-center overflow-hidden relative border-b border-gray-100">
          {company.logo ? (
            <img 
              src={getImageUrl(company.logo)} 
              alt={company.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {company.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
        
        {/* Company Info */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {company.name}
          </h3>
          <p className="text-gray-500 text-sm mb-4">Click to manage training modules</p>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleEdit}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 z-10 relative"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500 z-10 relative"
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleSelect}
              className="flex items-center text-blue-600 hover:text-blue-700 focus:outline-none z-10 relative"
            >
              <span className="text-sm font-medium">Manage</span>
              <ArrowLeft className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-300"></div>
      </div>
    </div>
  );
});

CompanyCardOptimized.displayName = 'CompanyCardOptimized';

export default CompanyCardOptimized;
