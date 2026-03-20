// src/components/dashboard/RiskSnapshot.tsx

import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { RiskPredictionResponse } from "@/types";

interface RiskSnapshotProps {
  riskPrediction: RiskPredictionResponse;
}

export default function RiskSnapshot({ riskPrediction }: RiskSnapshotProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "High":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
      case "Medium":
        return "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      default:
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "High":
        return <AlertTriangle className="h-5 w-5" />;
      case "Medium":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <TrendingDown className="h-5 w-5" />;
    }
  };

  if (!riskPrediction.hasData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Risk Prediction
        </h2>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            Not enough data for risk prediction yet.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Log more seizures to see predictions.
          </p>
        </div>
      </div>
    );
  }

  const highestRiskDay = riskPrediction.summary.highestRiskDay;
  const commonTriggers = riskPrediction.summary.commonTriggers.slice(0, 3);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Risk Prediction
      </h2>

      {/* Highest Risk Day */}
      {highestRiskDay && (
        <div
          className={`rounded-lg p-4 mb-6 border ${getRiskColor(highestRiskDay.riskLevel)}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-current/10">
                {getRiskIcon(highestRiskDay.riskLevel)}
              </div>
              <div>
                <p className="text-sm font-medium">Highest Risk Day</p>
                <p className="text-lg font-bold flex items-center gap-2">
                  {highestRiskDay.dayOfWeek}
                  <span className="text-sm font-normal">
                    ({new Date(highestRiskDay.date).toLocaleDateString()})
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Risk Score</p>
              <p className="text-xl font-bold">{highestRiskDay.riskScore}%</p>
            </div>
          </div>
          <p className="mt-3 text-sm">{highestRiskDay.recommendation}</p>
        </div>
      )}

      {/* Risk Factors */}
      {highestRiskDay && highestRiskDay.factors.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contributing Factors:
          </h3>
          <div className="flex flex-wrap gap-2">
            {highestRiskDay.factors.map((factor, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Common Triggers */}
      {commonTriggers.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Common Triggers:
          </h3>
          <div className="space-y-2">
            {commonTriggers.map((trigger, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {trigger.item}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {trigger.count} seizures
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
