// src/components/medications/SmartReminder.tsx

import { Bell, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { SmartReminder as SmartReminderType } from "@/types";
import { CardSkeleton } from "@/components/ui/Skeleton";

interface SmartReminderProps {
  reminder?: SmartReminderType;
  isLoading: boolean;
}

export default function SmartReminder({
  reminder,
  isLoading,
}: SmartReminderProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  // Check if there are reminders (using the API response structure)
  const hasReminders = reminder?.reminders && reminder.reminders.length > 0;
  const remindersList = reminder?.reminders || [];

  if (!hasReminders) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Smart Reminder
          </h2>
        </div>
        <div className="text-center py-6">
          <Bell className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No upcoming reminders
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Add medications to get smart reminders.
          </p>
        </div>
      </div>
    );
  }

  const getPriorityColor = (adherence: number) => {
    if (adherence >= 90)
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
    if (adherence >= 70)
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
  };

  const getPriorityIcon = (adherence: number) => {
    if (adherence >= 90) return <CheckCircle className="h-4 w-4" />;
    if (adherence >= 70) return <Clock className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Smart Reminder
        </h2>
      </div>

      {/* Display all reminders from API */}
      <div className="space-y-3">
        {remindersList.map((reminderItem: any, idx: number) => (
          <div
            key={idx}
            className={`rounded-lg p-4 border ${getPriorityColor(reminderItem.currentAdherence || 100)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {getPriorityIcon(reminderItem.currentAdherence || 100)}
                  <span className="font-medium">
                    {reminderItem.medicationName}
                  </span>
                </div>
                <p className="text-sm">{reminderItem.dosage}</p>
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    Suggested time:{" "}
                    {reminderItem.displayTime || reminderItem.suggestedTime}
                  </span>
                </div>
                <p className="text-xs mt-2 text-gray-600 dark:text-gray-300">
                  {reminderItem.reason}
                </p>
                {reminderItem.currentAdherence !== undefined && (
                  <p className="text-xs mt-1 text-green-600 dark:text-green-400">
                    Adherence: {reminderItem.currentAdherence}%
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Display note if present */}
      {reminder?.note && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          💡 {reminder.note}
        </p>
      )}
    </div>
  );
}
