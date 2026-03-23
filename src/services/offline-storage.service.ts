// src/services/offline-storage.service.ts

import Dexie, { Table } from "dexie";
import { Seizure, CreateSeizureRequest } from "@/types";

// Define the offline database schema
export class OfflineDatabase extends Dexie {
  seizures!: Table<
    Seizure & {
      syncStatus: "pending" | "synced" | "failed";
      offlineId: string;
    },
    string
  >;
  pendingQueue!: Table<
    {
      id?: number;
      type: "create_seizure";
      data: CreateSeizureRequest;
      timestamp: number;
      retryCount: number;
    },
    number
  >;

  constructor() {
    super("NeuraTrackDB");

    this.version(1).stores({
      seizures: "offlineId, occurredAt, syncStatus",
      pendingQueue: "++id, type, timestamp",
    });
  }
}

export const db = new OfflineDatabase();

// Check if online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Listen to online/offline events
export const addConnectivityListeners = (
  onOnline: () => void,
  onOffline: () => void,
) => {
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);

  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
};

// Generate unique offline ID
export const generateOfflineId = (): string => {
  return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
