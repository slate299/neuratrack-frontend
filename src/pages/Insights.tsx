// src/pages/Insights.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { insightsService } from "@/services/insights.service";
import { DateRange, TrainingDataResponse } from "@/types";
import { Calendar, TrendingUp, Clock, Zap } from "lucide-react";
import HourlyHeatmap from "@/components/insights/HourlyHeatmap";
import DayOfWeekChart from "@/components/insights/DayOfWeekChart";
import TriggerChart from "@/components/insights/TriggerChart";
import TimelineView from "@/components/insights/TimelineView";
import DateRangePicker from "@/components/insights/DateRangePicker";
import { PageSkeleton } from "@/components/ui/Skeleton";

type TabType = "overview" | "patterns" | "timeline";

export default function Insights() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  const {
    data: trainingData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["training-data"],
    queryFn: () => insightsService.getTrainingData(90),
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error || !trainingData?.success) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <h3 className="text-yellow-800 dark:text-yellow-300 font-medium text-lg">
            Not Enough Data Yet
          </h3>
          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-2">
            Log more seizures to see insights and patterns.
          </p>
          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
            You need at least a few seizures to generate meaningful analytics.
          </p>
        </div>
      </div>
    );
  }

  const { stats, data: seizures } = trainingData;

  // Convert hourDistribution to format expected by HourlyHeatmap
  const hourlyData = stats.hourDistribution.map((h) => ({
    hour: h.hour,
    count: h.count,
  }));

  // Convert dayDistribution to format expected by DayOfWeekChart
  const dayOfWeekData = stats.dayDistribution.map((d) => ({
    day: d.day,
    dayIndex: getDayIndex(d.day),
    count: d.count,
    averageRisk: 0,
  }));

  // Convert commonTriggers to format expected by TriggerChart
  const triggerData = stats.commonTriggers.map((t) => ({
    trigger: t.item,
    count: t.count,
    percentage: (t.count / stats.totalSeizures) * 100,
  }));

  // Calculate most common time of day
  const getMostCommonTimeOfDay = () => {
    const peakHour = stats.hourDistribution.reduce(
      (max, h) => (h.count > max.count ? h : max),
      { hour: 0, count: 0 },
    );
    if (peakHour.count === 0) return "No data";
    if (peakHour.hour < 12) return `${peakHour.hour}:00 AM`;
    if (peakHour.hour === 12) return "12:00 PM";
    return `${peakHour.hour - 12}:00 PM`;
  };

  // Calculate average duration (if any seizures have duration)
  const averageDuration = Math.round(
    seizures.reduce((sum, s) => sum + (s.features.duration || 0), 0) /
      seizures.filter((s) => s.features.duration).length || 0,
  );

  // Get most common trigger
  const mostCommonTrigger = stats.commonTriggers[0]?.item || "None yet";

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: TrendingUp },
    { id: "patterns" as TabType, label: "Patterns", icon: Calendar },
    { id: "timeline" as TabType, label: "Timeline", icon: Clock },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Insights & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Understand your seizure patterns and identify trends
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Seizures
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalSeizures}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Avg Duration
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {averageDuration || "N/A"}s
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Common Trigger
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {mostCommonTrigger}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Common Time
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {getMostCommonTimeOfDay()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600 dark:text-primary-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HourlyHeatmap hourlyData={hourlyData} />
              <DayOfWeekChart dayOfWeekData={dayOfWeekData} />
            </div>
            <TriggerChart triggerData={triggerData} />
          </>
        )}

        {activeTab === "patterns" && (
          <div className="space-y-6">
            <HourlyHeatmap hourlyData={hourlyData} />
            <DayOfWeekChart dayOfWeekData={dayOfWeekData} />
            <TriggerChart triggerData={triggerData} />
          </div>
        )}

        {activeTab === "timeline" && <TimelineView seizures={seizures} />}
      </div>
    </div>
  );
}

// Helper function to get day index
function getDayIndex(day: string): number {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days.indexOf(day);
}
