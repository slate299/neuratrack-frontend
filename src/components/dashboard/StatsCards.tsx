// src/components/dashboard/StatsCards.tsx

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Clock,
  Zap,
  Activity,
} from "lucide-react";
import { SeizureSummary } from "@/types";

interface StatsCardsProps {
  summary: SeizureSummary | null | undefined;
}

export default function StatsCards({ summary }: StatsCardsProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 p-5"
          >
            <div className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-xl w-12 h-12" />
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
      icon: Activity,
      color: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950/30",
      change: null,
    },
    {
      title: "This Week",
      value: summary.seizuresThisWeek ?? 0,
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-950/30",
      change: null,
    },
    {
      title: "This Month",
      value: summary.seizuresThisMonth ?? 0,
      icon: Calendar,
      color: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
      change: null,
    },
    {
      title: "Avg Duration",
      value: summary.averageDuration ? `${summary.averageDuration}s` : "N/A",
      icon: Clock,
      color: "from-green-500 to-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
      change: null,
    },
    {
      title: "Most Common",
      value: summary.mostCommonTrigger || "No data",
      icon: Zap,
      color: "from-orange-500 to-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
      change: null,
      subtitle: "Trigger",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
      {cards.map((card, index) => (
        <div
          key={index}
          className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 p-5 hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className={`${card.bg} p-2.5 rounded-xl`}>
              <card.icon
                className={`h-5 w-5 text-${card.color.split("-")[1]}-600`}
              />
            </div>
            {index === 0 && summary.trend && (
              <div className="flex items-center gap-1 text-xs bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full">
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
            {card.subtitle && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {card.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
