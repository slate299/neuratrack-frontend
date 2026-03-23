// src/hooks/usePullToRefresh.ts

import { useState, useCallback, useRef, useEffect } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => Promise<void>;
  threshold?: number;
}

export function usePullToRefresh({ onRefresh, threshold = 80 }: UsePullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const startY = useRef(0);
  const currentY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling.current) return;
    
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0 && window.scrollY === 0) {
      e.preventDefault();
      const progress = Math.min(diff / threshold, 1);
      setPullProgress(progress * 100);
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    
    const diff = currentY.current - startY.current;
    
    if (diff > threshold && !isRefreshing) {
      setIsRefreshing(true);
      setPullProgress(100);
      await onRefresh();
      setIsRefreshing(false);
    }
    
    setPullProgress(0);
    isPulling.current = false;
    startY.current = 0;
    currentY.current = 0;
  }, [threshold, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    isRefreshing,
    pullProgress,
    refreshIndicator: (
      <div 
        className="flex justify-center items-center overflow-hidden transition-all duration-200"
        style={{ height: `${pullProgress * 0.6}px`, opacity: pullProgress / 100 }}
      >
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg 
            className={`animate-spin h-5 w-5 ${isRefreshing ? 'block' : 'hidden'}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{isRefreshing ? 'Refreshing...' : 'Pull to refresh'}</span>
        </div>
      </div>
    )
  };
}