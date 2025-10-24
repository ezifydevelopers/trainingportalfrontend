import React, { ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface WithLoadingProps {
  isLoading?: boolean;
  loadingText?: string;
  loadingComponent?: React.ComponentType;
}

/**
 * Higher-Order Component for loading state management
 * Shows loading spinner while data is being fetched
 */
const withLoading = <P extends object>(
  WrappedComponent: ComponentType<P & WithLoadingProps>
) => {
  const LoadingComponent = (props: P & WithLoadingProps) => {
    const { 
      isLoading = false, 
      loadingText = "Loading...", 
      loadingComponent: CustomLoadingComponent,
      ...restProps 
    } = props;

    // If custom loading component provided, use it
    if (CustomLoadingComponent) {
      return isLoading ? <CustomLoadingComponent /> : <WrappedComponent {...(restProps as P)} />;
    }

    // Default loading UI
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600 text-sm">{loadingText}</p>
        </div>
      );
    }

    return <WrappedComponent {...(restProps as P)} />;
  };

  // Set display name for debugging
  LoadingComponent.displayName = `withLoading(${WrappedComponent.displayName || WrappedComponent.name})`;

  return LoadingComponent;
};

export default withLoading;
