// src/components/dashboard/StatsCards.tsx

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  Zap,
} from "lucide-react";
import { SeizureSummary } from "@/types";

interface StatsCardsProps {
  summary: SeizureSummary | null | undefined;
}

export default function StatsCards({ summary }: StatsCardsProps) {
  // If no data, show empty state
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg w-12 h-12" />
              <div className="mt-4 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getTrendIcon = () => {
    switch (summary.trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendText = () => {
    switch (summary.trend) {
      case "increasing":
        return `${summary.trendPercentage || 0}% increase`;
      case "decreasing":
        return `${summary.trendPercentage || 0}% decrease`;
      default:
        return "Stable";
    }
  };

  const cards = [
    {
      title: "Total Seizures",
      value: summary.totalSeizures ?? 0,
      icon: Zap,
      color: "bg-blue-500",
      change: null,
    },
    {
      title: "This Week",
      value: summary.seizuresThisWeek ?? 0,
      icon: Calendar,
      color: "bg-purple-500",
      change: null,
    },
    {
      title: "This Month",
      value: summary.seizuresThisMonth ?? 0,
      icon: Calendar,
      color: "bg-indigo-500",
      change: null,
    },
    {
      title: "Avg Duration",
      value: summary.averageDuration ? `${summary.averageDuration}s` : "N/A",
      icon: Clock,
      color: "bg-green-500",
      change: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            {index === 0 && summary.trend && (
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon()}
                <span className="text-gray-600 dark:text-gray-400">
                  {getTrendText()}
                </span>
              </div>
            )}
          </div>
          <div className="mt-4">
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              {card.title}
            </h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {card.value}
            </p>
          </div>
        </div>
      ))}

      {/* Most Common Trigger Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-3 rounded-lg">
            <Zap className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="mt-4">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Most Common Trigger
          </h3>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate">
            {summary.mostCommonTrigger || "No data yet"}
          </p>
        </div>
      </div>
    </div>
  );
}
