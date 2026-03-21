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

  if (
    !reminder?.reminder &&
    (!reminder?.nextReminders || reminder.nextReminders.length === 0)
  ) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      case "medium":
        return <Clock className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Smart Reminder
        </h2>
      </div>

      {/* Current Reminder */}
      {reminder?.reminder && (
        <div
          className={`rounded-lg p-4 mb-4 border ${getPriorityColor(reminder.reminder.priority)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getPriorityIcon(reminder.reminder.priority)}
                <span className="font-medium">
                  {reminder.reminder.medicationName}
                </span>
              </div>
              <p className="text-sm">{reminder.reminder.dosage}</p>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Clock className="h-4 w-4" />
                <span>Due at {reminder.reminder.scheduledTime}</span>
                {reminder.reminder.timeUntil <= 30 && (
                  <span className="text-xs font-medium">
                    (in {reminder.reminder.timeUntil} min)
                  </span>
                )}
              </div>
              <p className="text-xs mt-2">{reminder.reminder.reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Next Reminders */}
      {reminder?.nextReminders && reminder.nextReminders.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upcoming Doses
          </h3>
          <div className="space-y-2">
            {reminder.nextReminders.slice(0, 3).map((r, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {r.medicationName}
                  </span>
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {r.scheduledTime} ({r.timeUntil} min)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
