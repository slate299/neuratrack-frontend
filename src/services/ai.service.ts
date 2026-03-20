// src/services/ai.service.ts

import { axiosInstance } from "@/lib/axios";
import {
  AIParseRequest,
  AIParseResponse,
  CreateSeizureRequest,
  CreateSeizureResponse,
  Seizure,
  ParsedSeizureData,
} from "@/types";

export const aiService = {
  /**
   * Parse a natural language seizure note using AI
   */
  parseSeizureNote: async (note: string): Promise<ParsedSeizureData> => {
    try {
      const response = await axiosInstance.post<AIParseResponse>(
        "/api/ai/parse-seizure-note",
        { noteText: note }, // Change from { note } to { noteText }
      );
      return response.data.parsed; // Change from response.data.data to response.data.parsed
    } catch (error) {
      console.error("Failed to parse seizure note:", error);
      throw error;
    }
  },

  /**
   * Save a seizure to the database
   */
  saveSeizure: async (seizureData: CreateSeizureRequest): Promise<Seizure> => {
    try {
      const response = await axiosInstance.post<CreateSeizureResponse>(
        "/api/seizures",
        seizureData,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to save seizure:", error);
      throw error;
    }
  },

  /**
   * Update an existing seizure
   */
  updateSeizure: async (
    id: number,
    seizureData: Partial<CreateSeizureRequest>,
  ): Promise<Seizure> => {
    try {
      const response = await axiosInstance.put<CreateSeizureResponse>(
        `/api/seizures/${id}`,
        seizureData,
      );
      return response.data.data;
    } catch (error) {
      console.error("Failed to update seizure:", error);
      throw error;
    }
  },

  /**
   * Delete a seizure
   */
  deleteSeizure: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/api/seizures/${id}`);
    } catch (error) {
      console.error("Failed to delete seizure:", error);
      throw error;
    }
  },
};
