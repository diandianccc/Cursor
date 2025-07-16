import { useEffect, useRef, useState } from 'react';

const usePanScroll = () => {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleMouseDown = (e) => {
      // Don't interfere with clicks on buttons, inputs, or other interactive elements
      if (e.target.closest('button, input, textarea, select, a, [role="button"]')) {
        return;
      }

      setIsDragging(true);
      setStartPos({ x: e.clientX, y: e.clientY });
      setScrollStart({ left: element.scrollLeft, top: element.scrollTop });
      
      // Prevent text selection while dragging
      e.preventDefault();
      
      // Change cursor immediately
      element.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      e.preventDefault();
      
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      
      // Apply scroll with some momentum
      element.scrollLeft = scrollStart.left - deltaX;
      element.scrollTop = scrollStart.top - deltaY;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      element.style.cursor = 'grab';
      document.body.style.userSelect = '';
    };

    const handleMouseLeave = () => {
      setIsDragging(false);
      element.style.cursor = 'grab';
      document.body.style.userSelect = '';
    };

    // Touch events for mobile
    const handleTouchStart = (e) => {
      if (e.target.closest('button, input, textarea, select, a, [role="button"]')) {
        return;
      }

      const touch = e.touches[0];
      setIsDragging(true);
      setStartPos({ x: touch.clientX, y: touch.clientY });
      setScrollStart({ left: element.scrollLeft, top: element.scrollTop });
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;

      e.preventDefault();
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startPos.x;
      const deltaY = touch.clientY - startPos.y;
      
      element.scrollLeft = scrollStart.left - deltaX;
      element.scrollTop = scrollStart.top - deltaY;
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    // Set initial cursor
    element.style.cursor = 'grab';
    
    // Add event listeners
    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mouseleave', handleMouseLeave);
      
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      
      // Cleanup styles
      if (element) {
        element.style.cursor = '';
      }
      document.body.style.userSelect = '';
    };
  }, [isDragging, startPos, scrollStart]);

  return { 
    ref: elementRef, 
    isDragging,
    style: {
      cursor: isDragging ? 'grabbing' : 'grab',
      // Hide scrollbar but keep functionality
      scrollbarWidth: 'none',
      msOverflowStyle: 'none',
      WebkitScrollbar: { display: 'none' }
    }
  };
};

export default usePanScroll; 