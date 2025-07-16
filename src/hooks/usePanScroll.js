import { useEffect, useRef, useState, useCallback } from 'react';

const usePanScroll = () => {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const scrollStartRef = useRef({ left: 0, top: 0 });

  const handleMouseDown = useCallback((e) => {
    // Don't interfere with clicks on buttons, inputs, or other interactive elements
    if (e.target.closest('button, input, textarea, select, a, [role="button"]')) {
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    setIsDragging(true);
    setHasDragged(false);
    startPosRef.current = { x: e.clientX, y: e.clientY };
    scrollStartRef.current = { left: element.scrollLeft, top: element.scrollTop };
    
    // Change cursor immediately
    element.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    
    // Prevent default to avoid text selection
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const element = elementRef.current;
    if (!element) return;

    const deltaX = e.clientX - startPosRef.current.x;
    const deltaY = e.clientY - startPosRef.current.y;
    
    // Check if user has moved enough to be considered dragging
    if (!hasDragged && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      setHasDragged(true);
    }
    
    if (hasDragged || Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      e.preventDefault();
      e.stopPropagation();
      
      // Apply scroll
      element.scrollLeft = scrollStartRef.current.left - deltaX;
      element.scrollTop = scrollStartRef.current.top - deltaY;
    }
  }, [isDragging, hasDragged]);

  const handleMouseUp = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    setIsDragging(false);
    element.style.cursor = 'grab';
    document.body.style.userSelect = '';
    
    // Small delay to prevent click events if user dragged
    if (hasDragged) {
      setTimeout(() => setHasDragged(false), 10);
    } else {
      setHasDragged(false);
    }
  }, [hasDragged]);

  const handleMouseLeave = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    setIsDragging(false);
    setHasDragged(false);
    element.style.cursor = 'grab';
    document.body.style.userSelect = '';
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e) => {
    if (e.target.closest('button, input, textarea, select, a, [role="button"]')) {
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const touch = e.touches[0];
    setIsDragging(true);
    setHasDragged(false);
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    scrollStartRef.current = { left: element.scrollLeft, top: element.scrollTop };
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;

    const element = elementRef.current;
    if (!element) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosRef.current.x;
    const deltaY = touch.clientY - startPosRef.current.y;
    
    // Check if user has moved enough to be considered dragging
    if (!hasDragged && (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3)) {
      setHasDragged(true);
    }
    
    if (hasDragged || Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      e.preventDefault();
      element.scrollLeft = scrollStartRef.current.left - deltaX;
      element.scrollTop = scrollStartRef.current.top - deltaY;
    }
  }, [isDragging, hasDragged]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    // Small delay to prevent click events if user dragged
    if (hasDragged) {
      setTimeout(() => setHasDragged(false), 10);
    } else {
      setHasDragged(false);
    }
  }, [hasDragged]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

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
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, 
      handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { 
    ref: elementRef, 
    isDragging,
    hasDragged,
    style: {
      cursor: isDragging ? 'grabbing' : 'grab'
    }
  };
};

export default usePanScroll; 