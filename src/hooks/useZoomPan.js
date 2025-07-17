import { useState, useRef, useCallback, useEffect } from 'react';

export const useZoomPan = (initialZoom = 1, minZoom = 0.5, maxZoom = 3) => {
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Fit to view function
  const fitToView = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const parent = container.parentElement;
    if (!parent) return;

    // Get content dimensions
    const contentRect = container.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    
    // Calculate zoom to fit with some padding
    const paddingFactor = 0.9; // 90% to leave some margin
    const scaleX = (parentRect.width * paddingFactor) / contentRect.width;
    const scaleY = (parentRect.height * paddingFactor) / contentRect.height;
    const optimalZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
    
    // Clamp to zoom limits
    const newZoom = Math.min(Math.max(optimalZoom, minZoom), maxZoom);
    
    // Center the content
    const centerX = (parentRect.width - contentRect.width * newZoom) / 2;
    const centerY = (parentRect.height - contentRect.height * newZoom) / 2;
    
    setZoom(newZoom);
    setPan({ x: Math.max(centerX, 0), y: Math.max(centerY, 0) });
  }, [minZoom, maxZoom]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setZoom(prevZoom => Math.min(prevZoom * 1.2, maxZoom));
  }, [maxZoom]);

  const zoomOut = useCallback(() => {
    setZoom(prevZoom => Math.max(prevZoom / 1.2, minZoom));
  }, [minZoom]);

  const resetZoom = useCallback(() => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
  }, [initialZoom]);

  const setZoomLevel = useCallback((level) => {
    setZoom(Math.min(Math.max(level, minZoom), maxZoom));
  }, [minZoom, maxZoom]);

  // Pan functions
  const handleMouseDown = useCallback((e) => {
    // Don't start panning if clicking on interactive elements
    const target = e.target;
    const interactiveElements = ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A'];
    const hasInteractiveParent = target.closest('button, input, textarea, select, a, [role="button"]');
    
    if (interactiveElements.includes(target.tagName) || hasInteractiveParent) {
      return;
    }

    if (e.button === 0) { // Left mouse button
      setIsDragging(true);
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      });
      e.preventDefault();
    }
  }, [pan]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.min(Math.max(zoom * delta, minZoom), maxZoom);
      
      if (newZoom !== zoom) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          
          // Calculate zoom center offset
          const zoomFactor = newZoom / zoom;
          const newPanX = centerX - (centerX - pan.x - mouseX) * zoomFactor - (mouseX - centerX);
          const newPanY = centerY - (centerY - pan.y - mouseY) * zoomFactor - (mouseY - centerY);
          
          setPan({ x: newPanX, y: newPanY });
        }
        setZoom(newZoom);
      }
    }
  }, [zoom, pan, minZoom, maxZoom]);

  // Attach event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMoveGlobal = (e) => handleMouseMove(e);
    const handleMouseUpGlobal = () => handleMouseUp();

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Container props
  const containerProps = {
    ref: containerRef,
    onMouseDown: handleMouseDown,
    onWheel: handleWheel,
    style: {
      cursor: isDragging ? 'grabbing' : 'grab',
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      transformOrigin: '0 0',
      transition: isDragging ? 'none' : 'transform 0.1s ease-out',
      minWidth: '100%',
      minHeight: '100%',
    }
  };

  return {
    zoom,
    pan,
    isDragging,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToView,
    setZoomLevel,
    containerProps,
    canZoomIn: zoom < maxZoom,
    canZoomOut: zoom > minZoom,
  };
};

export default useZoomPan; 