// src/components/ui/PullToRefreshWrapper.tsx

import { ReactNode } from "react";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

interface PullToRefreshWrapperProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
}

export function PullToRefreshWrapper({
  children,
  onRefresh,
}: PullToRefreshWrapperProps) {
  const { containerRef, refreshIndicator } = usePullToRefresh({ onRefresh });

  return (
    <div ref={containerRef} className="relative overflow-y-auto">
      {refreshIndicator}
      {children}
    </div>
  );
}
