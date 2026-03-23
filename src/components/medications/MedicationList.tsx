// src/components/medications/MedicationList.tsx

import {
  Pill,
  Clock,
  Calendar,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Medication } from "@/types";
import { useSwipeToDelete } from "@/hooks/useSwipeToDelete";

interface MedicationListProps {
  medications: Medication[];
  onEdit: (medication: Medication) => void;
  onDelete: (id: number) => void;
}

export default function MedicationList({
  medications,
  onEdit,
  onDelete,
}: MedicationListProps) {
  if (medications.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
        <Pill className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          No medications added yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Click the "Add Medication" button to start tracking your medications.
        </p>
      </div>
    );
  }

  const activeMedications = medications.filter((m) => m.active !== false);
  const inactiveMedications = medications.filter((m) => m.active === false);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Medication Card with swipe-to-delete
  const MedicationCard = ({
    med,
    isActive,
  }: {
    med: Medication;
    isActive: boolean;
  }) => {
    // Use swipe-to-delete hook for this medication
    const { handlers, style, isDeleting } = useSwipeToDelete({
      onDelete: () => onDelete(med.id),
      threshold: 80,
    });

    return (
      <div
        {...handlers}
        style={style}
        className={`relative transition-all duration-200 ${
          isDeleting
            ? "opacity-0 translate-x-[-100%]"
            : "opacity-100 translate-x-0"
        }`}
      >
        {/* Delete indicator (shows when swiping) */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end bg-red-500 rounded-lg px-4 pointer-events-none">
          <Trash2 className="h-5 w-5 text-white" />
          <span className="text-white text-sm ml-2">Delete</span>
        </div>

        {/* Main card content */}
        <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {med.name}
                </h3>
                {isActive ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {med.dosage}
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{med.frequency}</span>
                </div>
                {med.times && med.times.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {med.times.map((t) => formatTime(t)).join(", ")}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Started: {new Date(med.startDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {med.notes && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {med.notes}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(med)}
                className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              {/* Delete button is now handled by swipe, but keep for desktop */}
              <button
                onClick={() => onDelete(med.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors lg:block hidden"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Swipe hint for mobile */}
          <div className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500 lg:hidden">
            ← Swipe to delete
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Pill className="h-5 w-5 text-primary-600" />
        My Medications
      </h2>

      <div className="space-y-4">
        {activeMedications.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Active
            </h3>
            <div className="space-y-3">
              {activeMedications.map((med) => (
                <MedicationCard key={med.id} med={med} isActive={true} />
              ))}
            </div>
          </div>
        )}

        {inactiveMedications.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 mt-4">
              Inactive
            </h3>
            <div className="space-y-3">
              {inactiveMedications.map((med) => (
                <MedicationCard key={med.id} med={med} isActive={false} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile swipe hint note */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-center lg:hidden">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          💡 Tip: Swipe left on a medication to delete
        </p>
      </div>
    </div>
  );
}
