// src/components/medications/AdherenceTracker.tsx

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { medicationService } from "@/services/medication.service";
import { MedicationAdherence } from "@/types";
import { CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { CardSkeleton } from "@/components/ui/Skeleton";

interface AdherenceTrackerProps {
  adherence: MedicationAdherence[];
  summary?: {
    total: number;
    taken: number;
    missed: number;
    pending: number;
    adherenceRate: number;
    currentStreak: number;
  };
  isLoading: boolean;
}

export default function AdherenceTracker({
  adherence,
  summary,
  isLoading,
}: AdherenceTrackerProps) {
  const queryClient = useQueryClient();

  const markTakenMutation = useMutation({
    mutationFn: ({
      medicationId,
      scheduledFor,
    }: {
      medicationId: number;
      scheduledFor: string;
    }) => medicationService.markAsTaken({ medicationId, scheduledFor }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adherence"] });
      queryClient.invalidateQueries({ queryKey: ["medication-insights"] });
      toast.success("Medication marked as taken!");
    },
    onError: () => {
      toast.error("Failed to mark as taken");
    },
  });

  if (isLoading) {
    return <CardSkeleton />;
  }

  if (!adherence || adherence.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-600" />
          Adherence Tracker
        </h2>
        <div className="text-center py-6">
          <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No adherence data yet
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Add medications and take them on time to track adherence.
          </p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "taken":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "missed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "taken":
        return "Taken";
      case "missed":
        return "Missed";
      default:
        return "Pending";
    }
  };

  const todayAdherence = adherence.filter(
    (a) =>
      new Date(a.scheduledFor).toDateString() === new Date().toDateString(),
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary-600" />
        Today's Adherence
      </h2>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.adherenceRate}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Adherence Rate
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {summary.currentStreak}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Day Streak
            </p>
          </div>
        </div>
      )}

      {/* Today's Doses */}
      <div className="space-y-3">
        {todayAdherence.length > 0 ? (
          todayAdherence.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.medicationName}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Scheduled: {format(new Date(item.scheduledFor), "h:mm a")}
                </p>
                {item.takenAt && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Taken at: {format(new Date(item.takenAt), "h:mm a")}
                  </p>
                )}
              </div>
              {item.status === "pending" && (
                <button
                  onClick={() =>
                    markTakenMutation.mutate({
                      medicationId: item.medicationId,
                      scheduledFor: item.scheduledFor,
                    })
                  }
                  disabled={markTakenMutation.isPending}
                  className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  Mark Taken
                </button>
              )}
              {item.status === "taken" && (
                <span className="text-xs text-green-600 dark:text-green-400">
                  ✓ Completed
                </span>
              )}
              {item.status === "missed" && (
                <span className="text-xs text-red-600 dark:text-red-400">
                  Missed
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No medications scheduled for today
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
