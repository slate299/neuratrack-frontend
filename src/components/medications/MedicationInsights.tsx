// src/components/medications/MedicationInsights.tsx

import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { MedicationInsights as MedicationInsightsType } from "@/types";
import { CardSkeleton } from "@/components/ui/Skeleton";

interface MedicationInsightsProps {
  insights?: MedicationInsightsType;
  isLoading: boolean;
}

export default function MedicationInsights({
  insights,
  isLoading,
}: MedicationInsightsProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  // Check if there are insights (using the API response structure)
  if (
    !insights?.success ||
    !insights?.hasMedications ||
    !insights?.insights?.length
  ) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Insights
          </h2>
        </div>
        <div className="text-center py-6">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No data available
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Add medications and track adherence to see AI insights.
          </p>
        </div>
      </div>
    );
  }

  const overallAdherence = insights.overallAdherence || 0;
  const getAdherenceColor = (rate: number) => {
    if (rate >= 90) return "text-green-600 dark:text-green-400";
    if (rate >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI Insights
        </h2>
      </div>

      {/* Overall Adherence */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Overall Adherence
          </span>
          <span
            className={`text-lg font-bold ${getAdherenceColor(overallAdherence)}`}
          >
            {overallAdherence}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-500"
            style={{ width: `${overallAdherence}%` }}
          />
        </div>
      </div>

      {/* Individual Medication Insights */}
      <div className="space-y-4">
        {insights.insights.map((item: any, idx: number) => (
          <div
            key={idx}
            className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {item.medicationName} {item.dosage}
                </h3>
              </div>
              <span
                className={`text-sm font-semibold ${getAdherenceColor(item.adherenceRate)}`}
              >
                {item.adherenceRate}%
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {item.insight}
            </p>
            {item.suggestion && (
              <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                💡 {item.suggestion}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>✓ {item.takenDoses} taken</span>
              <span>○ {item.missedDoses} missed</span>
              {item.lateDoses > 0 && <span>⚠️ {item.lateDoses} late</span>}
              <span>📅 {item.frequency}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {insights.recommendations && insights.recommendations.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recommendations
          </h4>
          {insights.recommendations.map((rec: any, idx: number) => (
            <p
              key={idx}
              className="text-sm text-gray-600 dark:text-gray-400 mb-1"
            >
              • {rec.message || rec}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
