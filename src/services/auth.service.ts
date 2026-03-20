// src/services/auth.service.ts

import { axiosInstance } from "@/lib/axios";
import {
  LoginCredentials,
  RegisterCredentials,
  User,
  AuthResponse,
  RefreshTokenResponse,
} from "@/types";

export const authService = {
  /**
   * Login user with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/api/auth/login", credentials);
    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await axiosInstance.post(
      "/api/auth/register",
      credentials,
    );
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await axiosInstance.get("/api/auth/me");
    return response.data.user;
  },

  /**
   * Refresh the authentication token
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axiosInstance.post("/api/auth/refresh", {
      refreshToken,
    });

    return response.data;
  },

  /**
   * Logout user (client-side only, token removal handled by context)
   */
  logout: (): void => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("refresh_token");
  },
};
