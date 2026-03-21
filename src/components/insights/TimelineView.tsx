// src/components/insights/TimelineView.tsx

import { Calendar, Clock, Zap } from "lucide-react";
import { format } from "date-fns";

interface TimelineSeizure {
  id: number;
  date: string;
  features: {
    hour: number;
    dayOfWeek: number;
    weekOfMonth: number;
    month: number;
    duration: number | null;
    triggers: string[] | null;
    symptoms: string[] | null;
    aiConfidence: number | null;
  };
}

interface TimelineViewProps {
  seizures: TimelineSeizure[];
}

export default function TimelineView({ seizures }: TimelineViewProps) {
  if (!seizures || seizures.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Seizure Timeline
        </h2>
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No seizures logged yet.
          </p>
        </div>
      </div>
    );
  }

  const getRiskLevelColor = (confidence?: number | null) => {
    if (!confidence)
      return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400";
    if (confidence >= 0.8)
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (confidence >= 0.5)
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  const getRiskLabel = (confidence?: number | null) => {
    if (!confidence) return "Manual entry";
    if (confidence >= 0.8) return "High confidence";
    if (confidence >= 0.5) return "Medium confidence";
    return "Low confidence";
  };

  const sortedSeizures = [...seizures].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Seizure Timeline
      </h2>
      <div className="space-y-4">
        {sortedSeizures.map((seizure) => (
          <div
            key={seizure.id}
            className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-medium text-gray-900 dark:text-white">
                  Seizure Event
                </span>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getRiskLevelColor(
                    seizure.features.aiConfidence,
                  )}`}
                >
                  {getRiskLabel(seizure.features.aiConfidence)}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(seizure.date), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{format(new Date(seizure.date), "h:mm a")}</span>
                </div>
                {seizure.features.duration && (
                  <span>{seizure.features.duration}s duration</span>
                )}
              </div>
              {seizure.features.triggers &&
                seizure.features.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {seizure.features.triggers.map((trigger, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                      >
                        {trigger}
                      </span>
                    ))}
                  </div>
                )}
              {seizure.features.symptoms &&
                seizure.features.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-xs text-gray-400">Symptoms:</span>
                    {seizure.features.symptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
