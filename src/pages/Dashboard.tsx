// src/pages/Dashboard.tsx

import { useQuery } from "@tanstack/react-query";
import { seizureService } from "@/services/seizure.service";
import StatsCards from "@/components/dashboard/StatsCards";
import RiskSnapshot from "@/components/dashboard/RiskSnapshot";
import RecentSeizures from "@/components/dashboard/RecentSeizures";
import QuickActions from "@/components/dashboard/QuickActions";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { Sparkles, TrendingUp, Award } from "lucide-react";

export default function Dashboard() {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => seizureService.getDashboardData(),
    refetchInterval: 30000,
    retry: 2,
  });

  // Get dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Get streak message
  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your seizure-free streak today!";
    if (streak === 1) return "1 day seizure-free! Keep going!";
    if (streak <= 3) return `${streak} days seizure-free! You're doing great!`;
    if (streak <= 7) return `${streak} days seizure-free! Amazing consistency!`;
    return `${streak} days seizure-free! You're on fire! 🔥`;
  };

  const streakDays = dashboardData?.summary?.seizureFreeStreak || 0;
  const greeting = getGreeting();
  const userName = localStorage.getItem("user_name") || "there";

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Sparkles className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-300">
              Dashboard Preview
            </h3>
          </div>
          <p className="text-yellow-700 dark:text-yellow-400">
            Some dashboard data is currently loading. This is normal while we
            fetch your latest information.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm text-yellow-700 dark:text-yellow-400 hover:underline flex items-center gap-1"
          >
            Refresh page
            <TrendingUp className="h-3 w-3" />
          </button>
        </div>

        <div className="mt-6 opacity-80">
          <StatsCards summary={null} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2">
              <RiskSnapshot
                riskPrediction={{
                  hasData: false,
                  success: false,
                  summary: {
                    totalSeizures: 0,
                    averageRiskScore: 0,
                    highestRiskDay: null as any,
                    commonTriggers: [],
                  },
                  predictions: [],
                }}
              />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>
          <RecentSeizures seizures={[]} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Welcome Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-primary-950/20 dark:via-gray-900 dark:to-blue-950/20 rounded-2xl p-6 border border-primary-100 dark:border-primary-800/30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">
                {greeting === "Good morning" && "🌅"}
                {greeting === "Good afternoon" && "☀️"}
                {greeting === "Good evening" && "🌙"}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 to-primary-600 dark:from-white dark:to-primary-400 bg-clip-text text-transparent">
                {greeting}, {userName}!
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your epilepsy management overview for today.
            </p>
          </div>

          {/* Streak Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl p-4 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                  Seizure-Free Streak
                </p>
                <p className="text-2xl font-bold text-amber-800 dark:text-amber-300">
                  {streakDays}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  {getStreakMessage(streakDays)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards summary={dashboardData?.summary} />

      {/* Risk Snapshot and Quick Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RiskSnapshot
            riskPrediction={
              dashboardData?.riskPrediction || {
                hasData: false,
                success: false,
                summary: {
                  totalSeizures: 0,
                  averageRiskScore: 0,
                  highestRiskDay: null as any,
                  commonTriggers: [],
                },
                predictions: [],
              }
            }
          />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Recent Seizures */}
      <RecentSeizures seizures={dashboardData?.recentSeizures || []} />
    </div>
  );
}
