// src/services/insights.service.ts

import { axiosInstance } from "@/lib/axios";
import { TrainingDataResponse } from "@/types";

export const insightsService = {
  /**
   * Get training data for charts and analytics
   */
  getTrainingData: async (days: number = 90): Promise<TrainingDataResponse> => {
    try {
      const response = await axiosInstance.get<TrainingDataResponse>(
        `/api/ai/training-data?days=${days}`,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch training data:", error);
      // Return empty/default data structure matching TrainingDataResponse
      return {
        success: false,
        stats: {
          totalSeizures: 0,
          dateRange: {
            from: new Date().toISOString(),
            to: new Date().toISOString(),
          },
          commonTriggers: [],
          commonSymptoms: [],
          hourDistribution: [],
          dayDistribution: [],
        },
        data: [],
      };
    }
  },
};
