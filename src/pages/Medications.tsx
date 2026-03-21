// src/pages/Medications.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicationService } from "@/services/medication.service";
import { Plus, Pill, Calendar, Clock, Bell } from "lucide-react";
import MedicationList from "@/components/medications/MedicationList";
import MedicationModal from "@/components/medications/MedicationModal";
import MedicationInsights from "@/components/medications/MedicationInsights";
import SmartReminder from "@/components/medications/SmartReminder";
import AdherenceTracker from "@/components/medications/AdherenceTracker";
import { CardSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

export default function Medications() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch medications
  const {
    data: medications,
    isLoading: medicationsLoading,
    error: medicationsError,
  } = useQuery({
    queryKey: ["medications"],
    queryFn: () => medicationService.getMedications(),
  });

  // Fetch adherence data
  const { data: adherence, isLoading: adherenceLoading } = useQuery({
    queryKey: ["adherence"],
    queryFn: () => medicationService.getAdherence(7),
  });

  // Fetch AI insights
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["medication-insights"],
    queryFn: () => medicationService.getMedicationInsights(),
  });

  // Fetch smart reminder
  const { data: reminder, isLoading: reminderLoading } = useQuery({
    queryKey: ["smart-reminder"],
    queryFn: () => medicationService.getSmartReminder(),
    refetchInterval: 60000, // Refresh every minute
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => medicationService.deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      queryClient.invalidateQueries({ queryKey: ["adherence"] });
      queryClient.invalidateQueries({ queryKey: ["medication-insights"] });
      toast.success("Medication deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete medication");
    },
  });

  const handleEdit = (medication: any) => {
    setEditingMedication(medication);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this medication?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingMedication(null);
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["medications"] });
    queryClient.invalidateQueries({ queryKey: ["adherence"] });
    queryClient.invalidateQueries({ queryKey: ["medication-insights"] });
    setIsModalOpen(false);
    setEditingMedication(null);
  };

  if (medicationsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div>
              <CardSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (medicationsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-300 font-medium">
            Error loading medications
          </h3>
          <p className="text-red-600 dark:text-red-400 text-sm mt-1">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  const adherenceRate = adherence?.summary.adherenceRate || 0;
  const currentStreak = adherence?.summary.currentStreak || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Pill className="h-7 w-7 text-primary-600" />
            Medication Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your medications and track adherence
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Medication
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Active Medications
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {medications?.filter((m) => m.active !== false).length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Adherence Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {adherenceRate}%
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
                Current Streak
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentStreak} days
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Next Reminder
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {reminder?.reminder
                  ? `${reminder.reminder.medicationName} at ${reminder.reminder.scheduledTime}`
                  : "No upcoming reminders"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Medication List */}
        <div className="lg:col-span-2 space-y-6">
          <MedicationList
            medications={medications || []}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <AdherenceTracker
            adherence={adherence?.data || []}
            summary={adherence?.summary}
            isLoading={adherenceLoading}
          />
        </div>

        {/* Right Column - Insights & Reminders */}
        <div className="space-y-6">
          <SmartReminder reminder={reminder} isLoading={reminderLoading} />
          <MedicationInsights insights={insights} isLoading={insightsLoading} />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <MedicationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        editingMedication={editingMedication}
      />
    </div>
  );
}
