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
      // Return empty/default data structure
      return {
        success: false,
        hasData: false,
        hourlyData: [],
        dayOfWeekData: [],
        triggerFrequency: [],
        seizures: [],
        summary: {
          totalSeizures: 0,
          averageDuration: 0,
          mostCommonTrigger: "No data yet",
          mostCommonTimeOfDay: "No data yet",
        },
      };
    }
  },
};
