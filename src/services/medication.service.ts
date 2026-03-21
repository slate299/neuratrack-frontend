// src/services/medication.service.ts

import { axiosInstance } from "@/lib/axios";
import {
  Medication,
  CreateMedicationRequest,
  UpdateMedicationRequest,
  MedicationsResponse,
  MedicationResponse,
  AdherenceResponse,
  MarkTakenRequest,
  MedicationInsights,
  SmartReminder,
} from "@/types";

export const medicationService = {
  /**
   * Get all medications for the current user
   */
  getMedications: async (): Promise<Medication[]> => {
    try {
      const response =
        await axiosInstance.get<MedicationsResponse>("/api/medications");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch medications:", error);
      return [];
    }
  },

  /**
   * Get a single medication by ID
   */
  getMedicationById: async (id: number): Promise<Medication | null> => {
    try {
      const response = await axiosInstance.get<MedicationResponse>(
        `/api/medications/${id}`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch medication:", error);
      return null;
    }
  },

  /**
   * Create a new medication
   */
  createMedication: async (
    data: CreateMedicationRequest,
  ): Promise<Medication> => {
    const response = await axiosInstance.post<MedicationResponse>(
      "/api/medications",
      data,
    );
    return response.data.data;
  },

  /**
   * Update an existing medication
   */
  updateMedication: async (
    id: number,
    data: UpdateMedicationRequest,
  ): Promise<Medication> => {
    const response = await axiosInstance.put<MedicationResponse>(
      `/api/medications/${id}`,
      data,
    );
    return response.data.data;
  },

  /**
   * Delete a medication
   */
  deleteMedication: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/medications/${id}`);
  },

  /**
   * Get adherence records for medications
   */
  getAdherence: async (days: number = 7): Promise<AdherenceResponse> => {
    const response = await axiosInstance.get<AdherenceResponse>(
      `/api/medications/adherence?days=${days}`,
    );
    return response.data;
  },

  /**
   * Mark a medication as taken
   */
  markAsTaken: async (data: MarkTakenRequest): Promise<void> => {
    await axiosInstance.post("/api/medications/adherence/mark", data);
  },

  /**
   * Get AI insights about medication effectiveness
   */
  getMedicationInsights: async (): Promise<MedicationInsights> => {
    try {
      const response = await axiosInstance.get<MedicationInsights>(
        "/api/ai/medication-insights",
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch medication insights:", error);
      return {
        success: false,
        insights: {
          effectiveness: {
            score: 0,
            message: "Not enough data",
            trend: "stable",
          },
          adherenceRate: {
            percentage: 0,
            streak: 0,
            bestStreak: 0,
            message: "No data",
          },
          recommendations: ["Log more seizures to see patterns"],
          commonMissedTimes: [],
        },
      };
    }
  },

  /**
   * Get smart reminder for next medication dose
   */
  getSmartReminder: async (): Promise<SmartReminder> => {
    try {
      const response = await axiosInstance.get<SmartReminder>(
        "/api/ai/smart-reminder",
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch smart reminder:", error);
      return {
        success: false,
        reminder: null,
        nextReminders: [],
      };
    }
  },
};
