// src/components/dashboard/RecentSeizures.tsx

import { Link } from "react-router-dom";
import { Calendar, Clock, AlertCircle, ChevronRight } from "lucide-react";
import { Seizure } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface RecentSeizuresProps {
  seizures: Seizure[];
}

export default function RecentSeizures({ seizures }: RecentSeizuresProps) {
  const getSeizureTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "focal":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "generalized":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "absence":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  if (seizures.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Seizures
          </h2>
          <Link
            to="/seizure-logger"
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Log Seizure
          </Link>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No seizures logged yet
          </p>
          <Link
            to="/seizure-logger"
            className="inline-block mt-4 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            Log your first seizure →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Seizures
        </h2>
        <Link
          to="/seizure-logger"
          className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {seizures.map((seizure) => (
          <div
            key={seizure.id}
            className="flex items-center justify-between p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getSeizureTypeColor(
                    seizure.seizureType,
                  )}`}
                >
                  {seizure.seizureType || "Unspecified"}
                </span>
                {seizure.aiConfidence && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    AI Confidence: {Math.round(seizure.aiConfidence * 100)}%
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(seizure.occurredAt).toLocaleDateString()}
                  </span>
                </div>
                {seizure.durationSeconds && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{seizure.durationSeconds}s</span>
                  </div>
                )}
                <span className="text-xs">
                  {formatDistanceToNow(new Date(seizure.occurredAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {seizure.triggers && seizure.triggers.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {seizure.triggers.slice(0, 3).map((trigger, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    >
                      {trigger}
                    </span>
                  ))}
                  {seizure.triggers.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{seizure.triggers.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
            <Link
              to={`/seizure-logger?edit=${seizure.id}`}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
