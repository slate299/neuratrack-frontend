// src/types/index.ts
// User types
export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

// Seizure types
export interface Seizure {
  id: number;
  occurredAt: string;
  durationSeconds?: number;
  seizureType?: string;
  triggers?: string[];
  symptoms?: string[];
  postIctalSymptoms?: string[];
  notes?: string;
  aiConfidence?: number;
  createdAt: string;
}

export interface ParsedSeizureData {
  seizureType?: string;
  durationSeconds?: number;
  triggers: string[];
  symptoms: string[];
  postIctalSymptoms: string[];
  timestamp: string;
  confidence: number;
}

// AI Types
export interface RiskPrediction {
  date: string;
  dayOfWeek: string;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
  factors: string[];
  recommendation: string;
}

export interface RiskPredictionResponse {
  success: boolean;
  hasData: boolean;
  summary: {
    totalSeizures: number;
    averageRiskScore: number;
    highestRiskDay: RiskPrediction;
    commonTriggers: Array<{ item: string; count: number }>;
  };
  predictions: RiskPrediction[];
}

export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  notes?: string;
}
