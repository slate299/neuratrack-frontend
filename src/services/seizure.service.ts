// src/services/seizure.service.ts

import { axiosInstance } from "@/lib/axios";
import {
  Seizure,
  SeizureSummary,
  SeizureSummaryResponse,
  RecentSeizuresResponse,
  RiskPredictionResponse,
} from "@/types";

export const seizureService = {
  /**
   * Get seizure summary statistics for dashboard
   */
  getSummary: async (): Promise<SeizureSummary> => {
    try {
      const response = await axiosInstance.get<SeizureSummaryResponse>(
        "/api/seizures/summary",
      );
      return response.data.data;
    } catch (error) {
      console.warn("Failed to fetch seizure summary:", error);
      // Return empty/default data structure
      return {
        totalSeizures: 0,
        seizuresThisWeek: 0,
        seizuresThisMonth: 0,
        averageDuration: 0,
        mostCommonTrigger: "No data yet",
        trend: "stable",
        trendPercentage: 0,
      };
    }
  },

  /**
   * Get recent seizures (default limit: 5)
   */
  getRecent: async (limit: number = 5): Promise<Seizure[]> => {
    try {
      const response = await axiosInstance.get<RecentSeizuresResponse>(
        `/api/seizures?limit=${limit}&sort=desc`,
      );
      return response.data.data;
    } catch (error) {
      console.warn("Failed to fetch recent seizures:", error);
      return []; // Return empty array
    }
  },

  /**
   * Get risk prediction for dashboard
   */
  getRiskPrediction: async (): Promise<RiskPredictionResponse> => {
    try {
      const response = await axiosInstance.get<RiskPredictionResponse>(
        "/api/ai/predict-risk",
      );
      return response.data;
    } catch (error) {
      console.warn("Failed to fetch risk prediction:", error);
      // Return empty/default data
      return {
        success: false,
        hasData: false,
        summary: {
          totalSeizures: 0,
          averageRiskScore: 0,
          highestRiskDay: null as any,
          commonTriggers: [],
        },
        predictions: [],
      };
    }
  },

  /**
   * Get all dashboard data in parallel
   */
  getDashboardData: async (): Promise<{
    summary: SeizureSummary;
    riskPrediction: RiskPredictionResponse;
    recentSeizures: Seizure[];
  }> => {
    const [summary, riskPrediction, recentSeizures] = await Promise.all([
      seizureService.getSummary(),
      seizureService.getRiskPrediction(),
      seizureService.getRecent(5),
    ]);

    return {
      summary,
      riskPrediction,
      recentSeizures,
    };
  },
};
