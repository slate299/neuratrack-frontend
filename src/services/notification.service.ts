// src/services/notification.service.ts

import toast from "react-hot-toast";

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface ScheduledReminder {
  id: string;
  medicationId: number;
  medicationName: string;
  dosage: string;
  scheduledTime: string; // HH:MM format
  timeUntil: number; // minutes
  recurring: boolean;
  lastNotified?: string;
}

class NotificationService {
  private permissionGranted = false;
  private scheduledReminders: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === "granted";

      if (this.permissionGranted) {
        toast.success(
          "Notifications enabled! You will receive medication reminders.",
        );
      }

      return this.permissionGranted;
    }

    toast.error(
      "Notifications are blocked. Please enable them in browser settings.",
    );
    return false;
  }

  /**
   * Check if notifications are supported and permitted
   */
  isSupported(): boolean {
    return "Notification" in window;
  }

  /**
   * Check if permission is granted
   */
  hasPermission(): boolean {
    return this.permissionGranted || Notification.permission === "granted";
  }

  /**
   * Show a push notification
   */
  showNotification(payload: NotificationPayload): void {
    if (!this.hasPermission()) {
      console.warn("Notification permission not granted");
      return;
    }

    // Also show toast for in-app notification
    toast(payload.body, {
      icon: "💊",
      duration: 10000,
    });

    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || "/icon-192.png",
      badge: payload.badge || "/icon-192.png",
      tag: payload.tag,
      data: payload.data,
      actions: payload.actions,
      requireInteraction: true, // Keep notification until user interacts
      silent: false,
    });

    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();

      // Navigate to medications page when clicked
      if (payload.data?.medicationId) {
        window.location.href = "/medications";
      }
    };
  }

  /**
   * Schedule a reminder for a medication
   */
  scheduleReminder(reminder: ScheduledReminder): void {
    if (!this.hasPermission()) return;

    const now = new Date();
    const [hours, minutes] = reminder.scheduledTime.split(":").map(Number);
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If scheduled time is in the past, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntil = scheduledTime.getTime() - now.getTime();
    const key = `${reminder.medicationId}_${reminder.scheduledTime}`;

    // Clear existing reminder if any
    if (this.scheduledReminders.has(key)) {
      clearTimeout(this.scheduledReminders.get(key));
    }

    // Schedule the reminder
    const timeout = setTimeout(() => {
      this.showNotification({
        title: `💊 Time for ${reminder.medicationName}`,
        body: `Take ${reminder.dosage} now`,
        tag: `medication-${reminder.medicationId}`,
        data: { medicationId: reminder.medicationId },
        actions: [
          { action: "taken", title: "✓ Taken" },
          { action: "snooze", title: "⏰ Snooze" },
        ],
      });

      // Store last notification time
      localStorage.setItem(
        `last_notification_${reminder.medicationId}`,
        new Date().toISOString(),
      );

      // Reschedule for next day if recurring
      if (reminder.recurring) {
        setTimeout(
          () => {
            this.scheduleReminder(reminder);
          },
          24 * 60 * 60 * 1000,
        );
      }
    }, timeUntil);

    this.scheduledReminders.set(key, timeout);
  }

  /**
   * Schedule all active medications
   */
  scheduleAllReminders(
    medications: Array<{
      id: number;
      name: string;
      dosage: string;
      times: string[];
      active: boolean;
    }>,
  ): void {
    // Clear all existing reminders
    this.clearAllReminders();

    const activeMeds = medications.filter((m) => m.active !== false);

    for (const med of activeMeds) {
      for (const time of med.times) {
        this.scheduleReminder({
          id: `${med.id}_${time}`,
          medicationId: med.id,
          medicationName: med.name,
          dosage: med.dosage,
          scheduledTime: time,
          timeUntil: 0,
          recurring: true,
        });
      }
    }
  }

  /**
   * Clear a specific reminder
   */
  clearReminder(medicationId: number, time: string): void {
    const key = `${medicationId}_${time}`;
    if (this.scheduledReminders.has(key)) {
      clearTimeout(this.scheduledReminders.get(key));
      this.scheduledReminders.delete(key);
    }
  }

  /**
   * Clear all reminders
   */
  clearAllReminders(): void {
    for (const timeout of this.scheduledReminders.values()) {
      clearTimeout(timeout);
    }
    this.scheduledReminders.clear();
  }

  /**
   * Get pending reminders count
   */
  getPendingCount(): number {
    return this.scheduledReminders.size;
  }

  /**
   * Show test notification
   */
  testNotification(): void {
    this.showNotification({
      title: "🔔 NeuraTrack Notifications",
      body: "Your medication reminders are now active!",
      icon: "/icon-192.png",
    });
  }
}

export const notificationService = new NotificationService();
