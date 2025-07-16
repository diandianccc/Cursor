import React, { useState, useEffect } from 'react';

const PanScrollIndicator = ({ containerRef, className = "" }) => {
  const [hasScroll, setHasScroll] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const checkScroll = () => {
      if (containerRef?.current) {
        const element = containerRef.current;
        setHasScroll(element.scrollWidth > element.clientWidth);
      }
    };

    // Check initially
    checkScroll();

    // Check on resize
    window.addEventListener('resize', checkScroll);
    
    // Hide hint after 5 seconds
    const timer = setTimeout(() => setShowHint(false), 5000);

    return () => {
      window.removeEventListener('resize', checkScroll);
      clearTimeout(timer);
    };
  }, [containerRef]);

  if (!hasScroll || !showHint) return null;

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded-md px-3 py-1 animate-pulse ${className}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l4-4m0 0l4 4m-4-4v12" />
      </svg>
      <span>💡 Tip: Click and drag to pan horizontally</span>
      <button 
        onClick={() => setShowHint(false)}
        className="ml-2 text-gray-400 hover:text-gray-600"
        title="Dismiss"
      >
        ×
      </button>
    </div>
  );
};

export default PanScrollIndicator; 