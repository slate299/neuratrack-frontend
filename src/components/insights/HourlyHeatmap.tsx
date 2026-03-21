// src/components/insights/HourlyHeatmap.tsx

import { HourlyData } from "@/types";

interface HourlyHeatmapProps {
  hourlyData: HourlyData[];
}

export default function HourlyHeatmap({ hourlyData }: HourlyHeatmapProps) {
  const getIntensityColor = (count: number, maxCount: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-gray-800";
    const intensity = count / maxCount;
    if (intensity < 0.25) return "bg-blue-200 dark:bg-blue-900/50";
    if (intensity < 0.5) return "bg-blue-300 dark:bg-blue-800";
    if (intensity < 0.75) return "bg-blue-400 dark:bg-blue-700";
    return "bg-blue-500 dark:bg-blue-600";
  };

  const maxCount = Math.max(...hourlyData.map((h) => h.count), 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Hourly Seizure Pattern
      </h2>
      <div className="grid grid-cols-6 gap-1">
        {hours.map((hour) => {
          const data = hourlyData.find((h) => h.hour === hour);
          const count = data?.count || 0;
          const colorClass = getIntensityColor(count, maxCount);

          return (
            <div key={hour} className="text-center">
              <div
                className={`h-12 rounded-md ${colorClass} transition-all hover:scale-105 cursor-pointer`}
                title={`${hour}:00 - ${count} seizures`}
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                {hour}:00
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-4 text-xs text-gray-500 dark:text-gray-400">
        <span>Low</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 bg-blue-200 dark:bg-blue-900/50 rounded" />
          <div className="w-4 h-4 bg-blue-300 dark:bg-blue-800 rounded" />
          <div className="w-4 h-4 bg-blue-400 dark:bg-blue-700 rounded" />
          <div className="w-4 h-4 bg-blue-500 dark:bg-blue-600 rounded" />
        </div>
        <span>High</span>
      </div>
    </div>
  );
}
