// src/components/auth/AuthLoadingScreen.tsx

import React from "react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export const AuthLoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 dark:text-gray-400 animate-pulse">
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
};
