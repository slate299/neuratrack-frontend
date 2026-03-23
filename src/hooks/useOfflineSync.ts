// src/hooks/useOfflineSync.ts

import { useState, useEffect, useCallback } from "react";
import {
  isOnline,
  addConnectivityListeners,
} from "@/services/offline-storage.service";
import {
  offlineSyncService,
  offlineSeizureService,
} from "@/services/offline-seizure.service";
import toast from "react-hot-toast";

export const useOfflineSync = () => {
  const [online, setOnline] = useState(isOnline());
  const [syncPending, setSyncPending] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkSyncStatus = useCallback(async () => {
    const { pending } = await offlineSyncService.getSyncStatus();
    setSyncPending(pending);
  }, []);

  const syncNow = useCallback(async () => {
    if (!online) {
      toast.error("Cannot sync while offline");
      return;
    }

    if (isSyncing) return;

    setIsSyncing(true);
    try {
      const { success, failed } = await offlineSyncService.syncPendingItems();

      if (success > 0) {
        toast.success(`Synced ${success} seizure${success !== 1 ? "s" : ""}`);
      }
      if (failed > 0) {
        toast.error(`Failed to sync ${failed} item${failed !== 1 ? "s" : ""}`);
      }

      await checkSyncStatus();
    } finally {
      setIsSyncing(false);
    }
  }, [online, isSyncing, checkSyncStatus]);

  // Listen to online/offline events
  useEffect(() => {
    const cleanup = addConnectivityListeners(
      () => {
        setOnline(true);
        toast.success("Back online! Syncing data...");
        syncNow();
      },
      () => {
        setOnline(false);
        toast.warning(
          "You are offline. Data will be saved locally and synced when back online.",
        );
      },
    );

    return cleanup;
  }, [syncNow]);

  // Initial sync check
  useEffect(() => {
    checkSyncStatus();
  }, [checkSyncStatus]);

  return {
    online,
    syncPending,
    isSyncing,
    syncNow,
  };
};
