import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ManagerCompanyModules from './ManagerCompanyModules';

const ManagerCompanyModulesWrapper = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();

  if (!user?.id) {
    return <div>Loading...</div>;
  }

  return (
    <ManagerCompanyModules 
      selectedCompanyId={companyId ? parseInt(companyId) : undefined}
      managerId={user.id}
    />
  );
};

export default ManagerCompanyModulesWrapper;
