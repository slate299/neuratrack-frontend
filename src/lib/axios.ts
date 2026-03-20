// src/lib/axios.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env, devLog } from "@/config/env";

// Track if we're currently refreshing the token
let isRefreshing = false;

// Queue of failed requests to retry after token refresh
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

// Process the queue of failed requests
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Development logging
if (env.isDevelopment && env.enableLogging) {
  devLog("Axios configured with:", {
    baseURL: env.apiBaseUrl,
    timeout: env.apiTimeout,
    environment: env.appEnv,
  });
}

export const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to check if token is expired
const isTokenExpired = (): boolean => {
  const tokenExpiry = localStorage.getItem("token_expiry");
  if (!tokenExpiry) return true;

  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
  return Date.now() >= parseInt(tokenExpiry, 10) - bufferTime;
};

// Helper to refresh token
const refreshToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    const response = await axios.post(
      `${env.apiBaseUrl}/api/auth/refresh`,
      { refreshToken },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const { token, tokenExpiry } = response.data;

    // Update stored token
    localStorage.setItem("auth_token", token);
    localStorage.setItem("token_expiry", tokenExpiry.toString());

    if (env.enableLogging) {
      devLog("Token refreshed successfully");
    }

    return token;
  } catch (error) {
    // Refresh failed, clear all auth data
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("refresh_token");

    if (env.enableLogging) {
      devLog("Token refresh failed:", error);
    }

    throw error;
  }
};

// Request interceptor to add auth token and check expiry
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");

    // If no token, proceed without auth
    if (!token) {
      return config;
    }

    // Check if token is expired
    if (isTokenExpired()) {
      // If we're not already refreshing, attempt to refresh
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshToken();
          config.headers.Authorization = `Bearer ${newToken}`;

          // Process any queued requests with the new token
          processQueue(null, newToken);
          isRefreshing = false;

          return config;
        } catch (error) {
          // Refresh failed, clear auth and redirect
          processQueue(error as Error, null);
          isRefreshing = false;
          window.location.href = "/login";
          return Promise.reject(error);
        }
      }

      // If we're already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        })
        .catch((error) => {
          return Promise.reject(error);
        });
    }

    // Token is valid, add it to the request
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Log API errors in development
    if (env.enableLogging && env.isDevelopment) {
      devLog("API Error:", {
        url: originalRequest?.url,
        status: error.response?.status,
        message: error.message,
      });
    }

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If we're not already refreshing, attempt to refresh
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshToken();

          // Update the failed request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Process queued requests
          processQueue(null, newToken);
          isRefreshing = false;

          // Retry the original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect
          processQueue(refreshError as Error, null);
          isRefreshing = false;

          // Clear all auth data
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          localStorage.removeItem("token_expiry");
          localStorage.removeItem("refresh_token");

          // Redirect to login
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      // If we're already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    return Promise.reject(error);
  },
);
