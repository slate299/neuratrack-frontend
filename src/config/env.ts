// src/config/env.ts

interface EnvConfig {
  apiBaseUrl: string;
  apiTimeout: number;
  appName: string;
  appEnv: "development" | "production" | "test";
  enableDevTools: boolean;
  enableLogging: boolean;
  enableMockApi: boolean;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

// Validate required environment variables
const validateEnv = (): void => {
  const requiredVars = ["VITE_API_BASE_URL"];
  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName],
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}\n` +
        "Please check your .env file",
    );
  }
};

// Parse and validate environment variables
export const env: EnvConfig = (() => {
  try {
    validateEnv();
  } catch (error) {
    console.error("Environment validation failed:", error);
    // In production, we want to fail loudly
    if (import.meta.env.PROD) {
      throw error;
    }
  }

  const appEnv =
    (import.meta.env.VITE_APP_ENV as string) ||
    (import.meta.env.DEV ? "development" : "production");

  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
    apiTimeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
    appName: import.meta.env.VITE_APP_NAME || "NeuraTrack",
    appEnv: appEnv as "development" | "production" | "test",
    enableDevTools: import.meta.env.VITE_ENABLE_DEVTOOLS === "true",
    enableLogging: import.meta.env.VITE_ENABLE_LOGGING === "true",
    enableMockApi: import.meta.env.VITE_ENABLE_MOCK_API === "true",
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === "true",
    enableErrorReporting:
      import.meta.env.VITE_ENABLE_ERROR_REPORTING === "true",
    isDevelopment: appEnv === "development",
    isProduction: appEnv === "production",
    isTest: appEnv === "test",
  };
})();

// Development-only logging utility
export const devLog = (...args: any[]): void => {
  if (env.enableLogging && env.isDevelopment) {
    console.log("[DEV]", ...args);
  }
};

// Development-only debug utility
export const debug = (component: string, ...args: any[]): void => {
  if (env.enableLogging && env.isDevelopment) {
    console.debug(`[DEBUG:${component}]`, ...args);
  }
};

// Log environment on startup (only in development)
if (env.isDevelopment && env.enableLogging) {
  console.log("🚀 App Configuration:", {
    environment: env.appEnv,
    apiBaseUrl: env.apiBaseUrl,
    appName: env.appName,
    features: {
      devTools: env.enableDevTools,
      logging: env.enableLogging,
      mockApi: env.enableMockApi,
      analytics: env.enableAnalytics,
      errorReporting: env.enableErrorReporting,
    },
  });
}
