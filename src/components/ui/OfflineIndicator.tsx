// src/components/ui/OfflineIndicator.tsx

import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Wifi, WifiOff, RefreshCw, Database } from "lucide-react";
import { useState, useEffect } from "react";

export const OfflineIndicator: React.FC = () => {
  const { online, syncPending, isSyncing, syncNow } = useOfflineSync();
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Auto-hide after 10 seconds if online and no pending items
    if (online && syncPending === 0) {
      const timer = setTimeout(() => setShow(false), 10000);
      return () => clearTimeout(timer);
    } else {
      setShow(true);
    }
  }, [online, syncPending]);

  if (!show && online && syncPending === 0) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 rounded-lg shadow-lg p-3 transition-all ${
        online
          ? syncPending > 0
            ? "bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800"
            : "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
          : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
      }`}
    >
      <div className="flex items-center gap-3">
        {online ? (
          <Wifi className="h-5 w-5 text-green-600 dark:text-green-400" />
        ) : (
          <WifiOff className="h-5 w-5 text-red-600 dark:text-red-400" />
        )}

        <div className="text-sm">
          {!online && (
            <span className="text-red-700 dark:text-red-300 font-medium">
              Offline Mode
            </span>
          )}
          {online && syncPending > 0 && (
            <span className="text-yellow-700 dark:text-yellow-300">
              {syncPending} item{syncPending !== 1 ? "s" : ""} pending sync
            </span>
          )}
          {online && syncPending === 0 && (
            <span className="text-green-700 dark:text-green-300">
              All data synced
            </span>
          )}
        </div>

        {syncPending > 0 && (
          <button
            onClick={syncNow}
            disabled={isSyncing}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Sync now"
          >
            <RefreshCw
              className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
          </button>
        )}
      </div>
    </div>
  );
};
