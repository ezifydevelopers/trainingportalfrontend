import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Edit, Building2 } from 'lucide-react';
import { Company } from '@/shared/types/common.types';
import { getImageUrl } from '@/shared/utils/imageUtils';

interface CompanySelectionSectionProps {
  companies: Company[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCompanySelect: (company: Company) => void;
  onCompanyEdit: (company: Company) => void;
  isLoading: boolean;
}

export const CompanySelectionSection: React.FC<CompanySelectionSectionProps> = ({
  companies,
  searchTerm,
  onSearchChange,
  onCompanySelect,
  onCompanyEdit,
  isLoading,
}) => {
  // Using the shared utility function for image URL generation

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="bg-white shadow-xl border-0 rounded-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-xl border-0 rounded-2xl">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
          Select Company
        </CardTitle>
        <p className="text-gray-600 text-lg">
          Choose a company to manage its training modules
        </p>
      </CardHeader>
      <CardContent className="p-8">
        <div className="mb-6">
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
          />
        </div>

        {/* Companies Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.map((company) => (
            <div
              key={company.id}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
              onClick={() => onCompanySelect(company)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center">
                  {company.logo ? (
                    <img 
                      src={getImageUrl(company.logo)} 
                      alt={company.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl ${company.logo ? 'hidden' : ''}`}>
                    {company.name.charAt(0)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompanyEdit(company);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-10 w-10 p-0 hover:bg-blue-200"
                  >
                    <Edit className="h-4 w-4 text-blue-600" />
                  </Button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 break-words">
                {company.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Manage</span>
                <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          ))}
        </div>

        {filteredCompanies.length === 0 && companies.length > 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">Try adjusting your search terms.</p>
          </div>
        )}

        {companies.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies assigned</h3>
            <p className="text-gray-600">Contact your administrator to get assigned to companies.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
