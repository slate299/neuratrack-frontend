// src/pages/Dashboard.tsx

import { useQuery } from "@tanstack/react-query";
import { seizureService } from "@/services/seizure.service";
import StatsCards from "@/components/dashboard/StatsCards";
import RiskSnapshot from "@/components/dashboard/RiskSnapshot";
import RecentSeizures from "@/components/dashboard/RecentSeizures";
import QuickActions from "@/components/dashboard/QuickActions";
import { PageSkeleton } from "@/components/ui/Skeleton";

export default function Dashboard() {
  const {
    data: dashboardData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => seizureService.getDashboardData(),
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 2, // Retry failed requests twice
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-yellow-800 dark:text-yellow-300 font-medium text-lg">
            Dashboard Preview Mode
          </h3>
          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-2">
            Some dashboard data is currently unavailable. This is normal while
            the backend APIs are being developed.
          </p>
          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
            {error instanceof Error
              ? error.message
              : "Please check back later for full functionality."}
          </p>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-yellow-700 dark:text-yellow-400 hover:underline"
            >
              Refresh page →
            </button>
          </div>
        </div>

        {/* Show partial UI with placeholder data */}
        <div className="mt-6">
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
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's your seizure activity overview.
        </p>
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
