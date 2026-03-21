// src/services/emergency.service.ts
import { axiosInstance } from "@/lib/axios";

export interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface EmergencyEvent {
  id: number;
  message: string | null;
  status: string;
  location: string | null;
  autoTriggered: boolean;
  contactsNotified: any;
  resolvedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface TriggerSOSResponse {
  success: boolean;
  data: {
    eventId: number;
    contactsNotified: Array<{ name: string; phone: string }>;
    timestamp: string;
    message: string;
  };
}

export const emergencyService = {
  // ==================== CONTACTS ====================

  /**
   * Get all emergency contacts
   */
  getContacts: async (): Promise<EmergencyContact[]> => {
    try {
      const response = await axiosInstance.get("/api/emergency/contacts");
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch emergency contacts:", error);
      throw error;
    }
  },

  /**
   * Create a new emergency contact
   */
  createContact: async (data: {
    name: string;
    phone: string;
    relationship: string;
  }): Promise<EmergencyContact> => {
    try {
      const response = await axiosInstance.post(
        "/api/emergency/contacts",
        data,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to create emergency contact:", error);
      throw error;
    }
  },

  /**
   * Update an emergency contact
   */
  updateContact: async (
    id: number,
    data: { name: string; phone: string; relationship: string },
  ): Promise<EmergencyContact> => {
    try {
      const response = await axiosInstance.put(
        `/api/emergency/contacts/${id}`,
        data,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to update emergency contact:", error);
      throw error;
    }
  },

  /**
   * Delete an emergency contact
   */
  deleteContact: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/emergency/contacts/${id}`);
    } catch (error) {
      console.error("Failed to delete emergency contact:", error);
      throw error;
    }
  },

  /**
   * Set a contact as primary
   */
  setPrimaryContact: async (id: number): Promise<EmergencyContact> => {
    try {
      const response = await axiosInstance.patch(
        `/api/emergency/contacts/${id}/primary`,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to set primary contact:", error);
      throw error;
    }
  },

  // ==================== EMERGENCY EVENTS ====================

  /**
   * Trigger SOS alert
   */
  triggerSOS: async (options?: {
    message?: string;
    location?: string;
    autoTriggered?: boolean;
  }): Promise<TriggerSOSResponse> => {
    try {
      const response = await axiosInstance.post(
        "/api/emergency/alert",
        options || {},
      );
      return response.data;
    } catch (error) {
      console.error("Failed to trigger SOS:", error);
      throw error;
    }
  },

  /**
   * Get all emergency events
   */
  getEmergencyEvents: async (limit?: number): Promise<EmergencyEvent[]> => {
    try {
      const url = limit
        ? `/api/emergency/events?limit=${limit}`
        : "/api/emergency/events";
      const response = await axiosInstance.get(url);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch emergency events:", error);
      throw error;
    }
  },

  /**
   * Get a specific emergency event
   */
  getEmergencyEvent: async (id: number): Promise<EmergencyEvent> => {
    try {
      const response = await axiosInstance.get(`/api/emergency/events/${id}`);
      return response.data.data;
    } catch (error) {
      console.error("Failed to fetch emergency event:", error);
      throw error;
    }
  },

  /**
   * Resolve an emergency event
   */
  resolveEmergencyEvent: async (
    id: number,
    notes?: string,
  ): Promise<EmergencyEvent> => {
    try {
      const response = await axiosInstance.patch(
        `/api/emergency/events/${id}/resolve`,
        {
          notes,
        },
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to resolve emergency event:", error);
      throw error;
    }
  },
};
