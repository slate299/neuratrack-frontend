// src/services/offline-seizure.service.ts

import { db, isOnline, generateOfflineId } from "./offline-storage.service";
import { axiosInstance } from "@/lib/axios";
import { Seizure, CreateSeizureRequest } from "@/types";
import toast from "react-hot-toast";

export interface OfflineSeizure extends Seizure {
  syncStatus: "pending" | "synced" | "failed";
  offlineId: string;
}

export const offlineSeizureService = {
  /**
   * Save seizure offline (will sync when online)
   */
  saveSeizureOffline: async (
    data: CreateSeizureRequest,
  ): Promise<OfflineSeizure> => {
    const offlineId = generateOfflineId();
    const now = new Date().toISOString();

    const offlineSeizure: OfflineSeizure = {
      id: 0, // Temporary ID
      offlineId,
      occurredAt: data.occurredAt,
      durationSeconds: data.durationSeconds,
      seizureType: data.seizureType,
      triggers: data.triggers || [],
      symptoms: data.symptoms || [],
      postIctalSymptoms: data.postIctalSymptoms || [],
      notes: data.notes,
      aiConfidence: data.aiConfidence,
      createdAt: now,
      syncStatus: "pending",
    };

    // Save to IndexedDB
    await db.seizures.add(offlineSeizure);

    // Add to sync queue
    await db.pendingQueue.add({
      type: "create_seizure",
      data,
      timestamp: Date.now(),
      retryCount: 0,
    });

    // If online, try to sync immediately
    if (isOnline()) {
      setTimeout(() => offlineSyncService.syncPendingItems(), 100);
    }

    return offlineSeizure;
  },

  /**
   * Get all offline seizures (pending or synced)
   */
  getOfflineSeizures: async (): Promise<OfflineSeizure[]> => {
    return await db.seizures.toArray();
  },

  /**
   * Get pending seizures (not yet synced)
   */
  getPendingSeizures: async (): Promise<OfflineSeizure[]> => {
    return await db.seizures.where("syncStatus").equals("pending").toArray();
  },

  /**
   * Update sync status of a seizure
   */
  updateSyncStatus: async (
    offlineId: string,
    status: "pending" | "synced" | "failed",
  ): Promise<void> => {
    await db.seizures
      .where("offlineId")
      .equals(offlineId)
      .modify({ syncStatus: status });
  },

  /**
   * Delete synced seizure from offline storage
   */
  deleteSyncedSeizure: async (offlineId: string): Promise<void> => {
    const seizure = await db.seizures
      .where("offlineId")
      .equals(offlineId)
      .first();
    if (seizure && seizure.syncStatus === "synced") {
      await db.seizures.where("offlineId").equals(offlineId).delete();
    }
  },

  /**
   * Clear all synced seizures (cleanup)
   */
  clearSyncedSeizures: async (): Promise<void> => {
    await db.seizures.where("syncStatus").equals("synced").delete();
  },
};

/**
 * Sync service for offline items
 */
export const offlineSyncService = {
  /**
   * Sync all pending items to server
   */
  syncPendingItems: async (): Promise<{ success: number; failed: number }> => {
    if (!isOnline()) {
      return { success: 0, failed: 0 };
    }

    const pendingItems = await db.pendingQueue.toArray();
    let success = 0;
    let failed = 0;

    for (const item of pendingItems) {
      try {
        if (item.type === "create_seizure") {
          // Try to save to server
          const response = await axiosInstance.post("/api/seizures", item.data);

          if (response.data.success) {
            // Find the offline seizure by matching data
            const offlineSeizures = await db.seizures
              .where("occurredAt")
              .equals(item.data.occurredAt)
              .toArray();

            // Update sync status
            for (const seizure of offlineSeizures) {
              if (seizure.syncStatus === "pending") {
                await offlineSeizureService.updateSyncStatus(
                  seizure.offlineId,
                  "synced",
                );
              }
            }

            // Remove from queue
            await db.pendingQueue.delete(item.id!);
            success++;

            // Show success notification for batch sync
            toast.success(
              `Synced seizure from ${new Date(item.data.occurredAt).toLocaleDateString()}`,
            );
          }
        }
      } catch (error) {
        console.error("Sync failed for item:", item, error);
        failed++;

        // Increment retry count
        await db.pendingQueue.update(item.id!, {
          retryCount: (item.retryCount || 0) + 1,
        });
      }
    }

    // Clean up old synced seizures
    if (success > 0) {
      await offlineSeizureService.clearSyncedSeizures();
    }

    return { success, failed };
  },

  /**
   * Get sync status summary
   */
  getSyncStatus: async (): Promise<{ pending: number; total: number }> => {
    const pending = await db.pendingQueue.count();
    const totalSeizures = await db.seizures.count();
    return { pending, total: totalSeizures };
  },
};
