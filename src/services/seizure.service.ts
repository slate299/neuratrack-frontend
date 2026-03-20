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
    const response = await axiosInstance.get<SeizureSummaryResponse>(
      "/api/seizures/summary",
    );
    return response.data.data;
  },

  /**
   * Get recent seizures (default limit: 5)
   */
  getRecent: async (limit: number = 5): Promise<Seizure[]> => {
    const response = await axiosInstance.get<RecentSeizuresResponse>(
      `/api/seizures?limit=${limit}&sort=desc`,
    );
    return response.data.data;
  },

  /**
   * Get risk prediction for dashboard
   */
  getRiskPrediction: async (): Promise<RiskPredictionResponse> => {
    const response = await axiosInstance.get<RiskPredictionResponse>(
      "/api/ai/predict-risk",
    );
    return response.data;
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
