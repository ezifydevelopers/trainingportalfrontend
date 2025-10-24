import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ManagerCompanyModules from './ManagerCompanyModules';
import { HOCPresets } from "@/components/HOCComposer";


interface ManagerCompanyModulesWrapperProps {
  user?: any;
  isAuthenticated?: boolean;
}

const ManagerCompanyModulesWrapper = ({ user, isAuthenticated }: ManagerCompanyModulesWrapperProps) => {
  const { companyId } = useParams<{ companyId: string }>();

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

// Export with comprehensive HOC protection
// Export with essential HOCs (no auth since handled by routing)
export default HOCPresets.publicPage(ManagerCompanyModulesWrapper);
