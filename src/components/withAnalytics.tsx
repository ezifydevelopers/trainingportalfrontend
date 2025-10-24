import React, { ComponentType, useEffect } from 'react';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  customData?: Record<string, any>;
}

interface WithAnalyticsProps {
  trackEvent?: (event: AnalyticsEvent) => void;
  trackPageView?: (page: string) => void;
  analyticsId?: string;
}

/**
 * Higher-Order Component for analytics tracking
 * Automatically tracks page views and provides event tracking
 */
const withAnalytics = <P extends object>(
  WrappedComponent: ComponentType<P & WithAnalyticsProps>
) => {
  const AnalyticsComponent = (props: P & WithAnalyticsProps) => {
    const { 
      trackEvent, 
      trackPageView, 
      analyticsId,
      ...restProps 
    } = props;

    // Track page view on mount
    useEffect(() => {
      if (trackPageView) {
        const pageName = WrappedComponent.displayName || WrappedComponent.name || 'Unknown';
        trackPageView(pageName);
      }
    }, [trackPageView]);

    // Default analytics functions if not provided
    const defaultTrackEvent = (event: AnalyticsEvent) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event:', event);
      }
      // In production, you would send to your analytics service
      // Example: gtag('event', event.action, { ...event });
    };

    const defaultTrackPageView = (page: string) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Page View:', page);
      }
      // In production, you would send to your analytics service
      // Example: gtag('config', 'GA_MEASUREMENT_ID', { page_title: page });
    };

    return (
      <WrappedComponent
        {...(restProps as P)}
        trackEvent={trackEvent || defaultTrackEvent}
        trackPageView={trackPageView || defaultTrackPageView}
        analyticsId={analyticsId}
      />
    );
  };

  // Set display name for debugging
  AnalyticsComponent.displayName = `withAnalytics(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AnalyticsComponent;
};

export default withAnalytics;
