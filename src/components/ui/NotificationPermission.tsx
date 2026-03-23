// src/components/ui/NotificationPermission.tsx

import { Bell, BellOff, Loader2 } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "./Button";
import { useState, useEffect } from "react";

export const NotificationPermission: React.FC = () => {
  const {
    permissionGranted,
    isSupported,
    isLoading,
    requestPermission,
    testNotification,
    pendingCount,
  } = useNotifications();

  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner if notifications are supported but not granted
    if (
      isSupported &&
      !permissionGranted &&
      !localStorage.getItem("notification_banner_dismissed")
    ) {
      setShowBanner(true);
    }
  }, [isSupported, permissionGranted]);

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("notification_banner_dismissed", "true");
  };

  if (!isSupported) return null;

  return (
    <>
      {/* Permission Banner */}
      {showBanner && (
        <div className="fixed bottom-20 right-4 z-40 md:bottom-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Enable Notifications
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Get reminders for your medications and important updates.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  onClick={requestPermission}
                  disabled={isLoading}
                  size="sm"
                  className="text-xs"
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <Bell className="h-3 w-3 mr-1" />
                  )}
                  Enable
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  Not Now
                </Button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-blue-400 hover:text-blue-600 dark:text-blue-500"
            >
              <BellOff className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Notification Status Button (optional - add to header) */}
      {permissionGranted && (
        <button
          onClick={testNotification}
          className="relative p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          title={`${pendingCount} active reminders`}
        >
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {pendingCount > 9 ? "9+" : pendingCount}
            </span>
          )}
        </button>
      )}
    </>
  );
};
