// src/hooks/useSwipeToDelete.ts

import { useState, useRef, TouchEvent } from "react";

interface UseSwipeToDeleteProps {
  onDelete: () => void;
  threshold?: number;
}

export function useSwipeToDelete({
  onDelete,
  threshold = 80,
}: UseSwipeToDeleteProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    startX.current = e.touches[0].clientX;
    isSwiping.current = true;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isSwiping.current) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Only allow swiping left (negative)
    if (diff < 0) {
      e.preventDefault();
      const offset = Math.max(diff, -threshold);
      setSwipeOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;

    const diff = currentX.current - startX.current;

    if (diff < -threshold) {
      setIsDeleting(true);
      onDelete();
      // Reset after animation
      setTimeout(() => {
        setSwipeOffset(0);
        setIsDeleting(false);
      }, 300);
    } else {
      setSwipeOffset(0);
    }

    isSwiping.current = false;
    startX.current = 0;
    currentX.current = 0;
  };

  return {
    swipeOffset,
    isDeleting,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    style: {
      transform: `translateX(${swipeOffset}px)`,
      transition: isSwiping.current ? "none" : "transform 0.2s ease-out",
    },
  };
}
