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
  seizureFreeStreak?: number; // Add this line
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

// ========== NEW TYPES FOR INSIGHTS & ANALYTICS ==========

// Hourly heatmap data
export interface HourlyData {
  hour: number; // 0-23
  count: number;
  riskScore?: number;
}

// Day of week data
export interface DayOfWeekData {
  day: string; // Monday, Tuesday, etc.
  dayIndex: number; // 0-6
  count: number;
  averageRisk: number;
}

// Trigger frequency data
export interface TriggerFrequency {
  trigger: string;
  count: number;
  percentage: number;
}

// Timeline event for seizure history
export interface TimelineEvent {
  id: number;
  date: string;
  time: string;
  seizureType: string;
  durationSeconds?: number;
  triggers: string[];
  riskLevel: "Low" | "Medium" | "High";
  notes?: string;
}

// Date range for filtering
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

// Training data response (for charts)
export interface TrainingDataResponse {
  success: boolean;
  stats: {
    totalSeizures: number;
    dateRange: {
      from: string;
      to: string;
    };
    commonTriggers: Array<{ item: string; count: number }>;
    commonSymptoms: Array<{ item: string; count: number }>;
    hourDistribution: Array<{ hour: number; count: number }>;
    dayDistribution: Array<{ day: string; count: number }>;
  };
  data: Array<{
    id: number;
    date: string;
    features: {
      hour: number;
      dayOfWeek: number;
      weekOfMonth: number;
      month: number;
      duration: number | null;
      triggers: string[] | null;
      symptoms: string[] | null;
      aiConfidence: number | null;
    };
  }>;
}

// Insights page filter state
export interface InsightsFilters {
  dateRange: DateRange;
  seizureType?: string;
  showRiskOnly?: boolean;
}

// ========== NEW TYPES FOR MEDICATION TRACKER ==========

// Complete Medication interface (enhance existing)
export interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string; // e.g., "daily", "twice-daily", "weekly"
  times: string[]; // e.g., ["08:00", "20:00"]
  startDate: string;
  endDate?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Medication adherence record
export interface MedicationAdherence {
  id: number;
  medicationId: number;
  medicationName: string;
  scheduledFor: string; // ISO date time
  takenAt: string | null; // ISO date time when taken
  status: "pending" | "taken" | "missed" | "late";
  notes?: string;
}

// AI Medication Insights (Updated)
export interface MedicationInsights {
  success: boolean;
  hasMedications: boolean;
  overallAdherence: number;
  insights: MedicationInsightItem[];
  recommendations: Array<{ type: string; message: string }> | string[];
}

// Smart Reminder (Updated)
export interface SmartReminder {
  success: boolean;
  reminders: SmartReminderItem[];
  note?: string;
}

// Create Medication Request
export interface CreateMedicationRequest {
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
}

// Update Medication Request
export interface UpdateMedicationRequest extends Partial<CreateMedicationRequest> {
  active?: boolean;
}

// API Response for Medications list
export interface MedicationsResponse {
  success: boolean;
  data: Medication[];
}

// API Response for Single Medication
export interface MedicationResponse {
  success: boolean;
  data: Medication;
}

// API Response for Adherence
export interface AdherenceResponse {
  success: boolean;
  data: MedicationAdherence[];
  summary: {
    total: number;
    taken: number;
    missed: number;
    pending: number;
    adherenceRate: number;
    currentStreak: number;
  };
}

// Mark Medication Taken Request
export interface MarkTakenRequest {
  medicationId: number;
  scheduledFor: string;
  takenAt?: string;
}

// ========== TYPES FOR AI CHAT ASSISTANT ==========

// Message role types
export type MessageRole = "user" | "assistant";

// Individual message in a conversation
export interface Message {
  id: number;
  role: MessageRole;
  content: string;
  createdAt: string;
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestedActions?: Array<{
      type: string;
      label: string;
      data?: any;
    }>;
  };
}

// Conversation summary (for sidebar)
export interface Conversation {
  id: number;
  title: string;
  lastMessagePreview: string;
  updatedAt: string;
  messageCount: number;
}

// Full conversation with messages
export interface ConversationDetail extends Conversation {
  messages: Message[];
}

// Request to send a message
export interface ChatRequest {
  message: string;
  conversationId?: number; // undefined = new conversation
}

// Response from chat endpoint
export interface ChatResponse {
  success: boolean;
  data: {
    message: Message;
    conversationId: number;
  };
}

// Response for fetching conversations
export interface ConversationsResponse {
  success: boolean;
  data: Conversation[];
}

// Response for fetching a single conversation
export interface ConversationResponse {
  success: boolean;
  data: ConversationDetail;
}

// ========== UPDATED TYPES FOR MEDICATION AI INSIGHTS (Matching Backend API) ==========

// Smart Reminder Item
export interface SmartReminderItem {
  medicationId: number;
  medicationName: string;
  dosage: string;
  suggestedTime: string;
  displayTime: string;
  reason: string;
  currentAdherence: number;
}

// Smart Reminder Response (Updated to match backend)
export interface SmartReminderResponse {
  success: boolean;
  reminders: SmartReminderItem[];
  note?: string;
}

// Medication Insight Item
export interface MedicationInsightItem {
  medicationId: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  adherenceRate: number;
  totalDoses: number;
  takenDoses: number;
  missedDoses: number;
  lateDoses: number;
  insight: string;
  suggestion: string;
  riskLevel: string;
  worstTime: string | null;
}

// Medication Insights Response (Updated to match backend)
export interface MedicationInsightsResponse {
  success: boolean;
  hasMedications: boolean;
  overallAdherence: number;
  insights: MedicationInsightItem[];
  recommendations: Array<{ type: string; message: string }> | string[];
}
