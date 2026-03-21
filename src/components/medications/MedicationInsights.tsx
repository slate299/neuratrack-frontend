// src/components/medications/MedicationInsights.tsx

import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  AlertCircle,
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

  // Guard: Check if insights and insights.insights exist
  if (!insights?.success || !insights?.insights) {
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
            Not enough data for insights yet.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Log more seizures and track medications to see AI insights.
          </p>
        </div>
      </div>
    );
  }

  const { effectiveness, adherenceRate, recommendations, commonMissedTimes } =
    insights.insights;

  const getTrendIcon = () => {
    if (!effectiveness) return <Minus className="h-4 w-4 text-yellow-500" />;
    switch (effectiveness.trend) {
      case "improving":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "declining":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getEffectivenessColor = () => {
    if (!effectiveness) return "text-gray-600 dark:text-gray-400";
    if (effectiveness.score >= 70) return "text-green-600 dark:text-green-400";
    if (effectiveness.score >= 40)
      return "text-yellow-600 dark:text-yellow-400";
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

      {/* Effectiveness Score */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Medication Effectiveness
          </span>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-lg font-bold ${getEffectivenessColor()}`}>
              {effectiveness?.score || 0}%
            </span>
          </div>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              (effectiveness?.score || 0) >= 70
                ? "bg-green-500"
                : (effectiveness?.score || 0) >= 40
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${effectiveness?.score || 0}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {effectiveness?.message || "No data available"}
        </p>
      </div>

      {/* Adherence Rate */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Adherence Rate
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {adherenceRate?.percentage || 0}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-primary-500"
            style={{ width: `${adherenceRate?.percentage || 0}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Current Streak: {adherenceRate?.streak || 0} days</span>
          <span>Best: {adherenceRate?.bestStreak || 0} days</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {adherenceRate?.message || "No adherence data yet"}
        </p>
      </div>

      {/* Common Missed Times */}
      {commonMissedTimes && commonMissedTimes.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Common Missed Doses
          </h3>
          <div className="flex flex-wrap gap-2">
            {commonMissedTimes.map((time, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
              >
                {time}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
              >
                <span className="text-primary-500">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
