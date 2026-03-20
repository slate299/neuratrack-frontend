// src/types/index.ts

// User types
export interface User {
  id: number;
  email: string;
  name?: string; // Backend uses 'name' instead of firstName/lastName
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  tokenExpiry: number | null; // Timestamp in milliseconds
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  refreshToken?: string; // Add refresh token if backend provides it
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string; // We'll keep this for frontend form
  lastName: string; // We'll combine to 'name' for backend
}

export interface StoredAuthData {
  token: string;
  user: User;
  tokenExpiry: number;
  refreshToken?: string; // Optional refresh token
}

// Add refresh token response type
export interface RefreshTokenResponse {
  token: string;
  tokenExpiry: number;
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

// ========== NEW TYPES FOR DASHBOARD ==========

// Seizure Summary for Dashboard
export interface SeizureSummary {
  totalSeizures: number;
  seizuresThisWeek: number;
  seizuresThisMonth: number;
  averageDuration: number;
  mostCommonTrigger: string;
  trend: "increasing" | "decreasing" | "stable";
  trendPercentage?: number;
}

// API Response for Seizure Summary
export interface SeizureSummaryResponse {
  success: boolean;
  data: SeizureSummary;
}

// API Response for Recent Seizures
export interface RecentSeizuresResponse {
  success: boolean;
  data: Seizure[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

// Quick Action Types
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

// Dashboard Data Aggregated
export interface DashboardData {
  summary: SeizureSummary;
  riskPrediction: RiskPredictionResponse;
  recentSeizures: Seizure[];
}

// ========== NEW TYPES FOR AI SEIZURE LOGGER ==========

// Request for AI parsing
export interface AIParseRequest {
  note: string;
}

// Response from AI parsing
export interface AIParseResponse {
  success: boolean;
  parsed: ParsedSeizureData;
  message?: string;
}

// Request to save a seizure
export interface CreateSeizureRequest {
  occurredAt: string;
  durationSeconds?: number;
  seizureType?: string;
  triggers?: string[];
  symptoms?: string[];
  postIctalSymptoms?: string[];
  notes?: string;
  aiConfidence?: number;
}

// Response after saving seizure
export interface CreateSeizureResponse {
  success: boolean;
  data: Seizure;
  message?: string;
}

// Example prompts for users
export interface ExamplePrompt {
  id: string;
  title: string;
  text: string;
}

// Predefined example prompts
export const examplePrompts: ExamplePrompt[] = [
  {
    id: "1",
    title: "Generalized Seizure",
    text: "Had a seizure at 3pm today. It lasted about 2 minutes. I was very tired afterward and had a headache. I think lack of sleep triggered it.",
  },
  {
    id: "2",
    title: "Focal Seizure",
    text: "Around lunchtime, I had a focal seizure. My left arm started twitching for about 30 seconds. I was stressed from work, that might be the trigger.",
  },
  {
    id: "3",
    title: "Absence Seizure",
    text: "This morning I had a brief absence seizure. I zoned out for maybe 10 seconds. My wife noticed I was staring. I'm feeling okay now.",
  },
  {
    id: "4",
    title: "Nocturnal Seizure",
    text: "Woke up at 2am with a seizure. My partner said it lasted around 90 seconds. I bit my tongue and feel very tired today.",
  },
];
