// src/components/insights/RiskChart.tsx

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrainingDataResponse } from "@/types";

interface RiskChartProps {
  predictions: TrainingDataResponse;
}

export default function RiskChart({ predictions }: RiskChartProps) {
  // This would come from a separate risk prediction endpoint
  // For now, we'll show a placeholder
  const hasRiskData = false;

  if (!hasRiskData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Risk Prediction
        </h2>
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            Risk prediction data coming soon. Log more seizures to see patterns.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        7-Day Risk Prediction
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={[]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="risk"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
        Risk levels above 70% indicate higher probability of seizure activity.
      </p>
    </div>
  );
}
