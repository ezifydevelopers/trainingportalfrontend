import React, { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ResponsiveDebug() {
  const isMobile = useIsMobile();
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });
  const [breakpoint, setBreakpoint] = useState('');

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
      
      if (window.innerWidth < 640) {
        setBreakpoint('Mobile (< 640px)');
      } else if (window.innerWidth < 1024) {
        setBreakpoint('Tablet (640px - 1023px)');
      } else {
        setBreakpoint('Desktop (1024px+)');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs z-50">
      <div className="space-y-1">
        <div>Screen: {screenSize.width}x{screenSize.height}</div>
        <div>Breakpoint: {breakpoint}</div>
        <div>useIsMobile: {isMobile ? 'true' : 'false'}</div>
        <div>Expected Mobile: {screenSize.width < 768 ? 'true' : 'false'}</div>
      </div>
    </div>
  );
}

