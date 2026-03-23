// src/hooks/useNotifications.ts

import { useState, useEffect, useCallback } from "react";
import { notificationService } from "@/services/notification.service";
import { medicationService } from "@/services/medication.service";
import toast from "react-hot-toast";

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Check support on mount
  useEffect(() => {
    setIsSupported(notificationService.isSupported());
    setPermissionGranted(notificationService.hasPermission());
    setPendingCount(notificationService.getPendingCount());
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!notificationService.isSupported()) {
      toast.error("Notifications are not supported in this browser");
      return false;
    }

    setIsLoading(true);
    const granted = await notificationService.requestPermission();
    setPermissionGranted(granted);
    setIsLoading(false);

    return granted;
  }, []);

  // Load and schedule medications
  const loadAndScheduleReminders = useCallback(async () => {
    if (!notificationService.hasPermission()) return;

    try {
      const medications = await medicationService.getMedications();

      notificationService.scheduleAllReminders(
        medications.map((med) => ({
          id: med.id,
          name: med.name,
          dosage: med.dosage,
          times: med.times,
          active: med.active !== false,
        })),
      );

      setPendingCount(notificationService.getPendingCount());
    } catch (error) {
      console.error("Failed to load medications for reminders:", error);
    }
  }, []);

  // Test notification
  const testNotification = useCallback(() => {
    if (notificationService.hasPermission()) {
      notificationService.testNotification();
    } else {
      toast.error("Please enable notifications first");
    }
  }, []);

  // Clear all reminders
  const clearAllReminders = useCallback(() => {
    notificationService.clearAllReminders();
    setPendingCount(0);
  }, []);

  // Reschedule reminders (call when medications change)
  const rescheduleReminders = useCallback(async () => {
    await loadAndScheduleReminders();
  }, [loadAndScheduleReminders]);

  return {
    permissionGranted,
    isSupported,
    pendingCount,
    isLoading,
    requestPermission,
    testNotification,
    clearAllReminders,
    rescheduleReminders,
  };
};
