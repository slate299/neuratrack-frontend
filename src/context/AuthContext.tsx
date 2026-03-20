// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { axiosInstance } from "@/lib/axios";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  StoredAuthData,
} from "@/types";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// Helper function to check if token is expired
const isTokenExpired = (expiryTimestamp: number | null): boolean => {
  if (!expiryTimestamp) return true;
  // Add 5-minute buffer to refresh before actual expiry
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  return Date.now() >= expiryTimestamp - bufferTime;
};

// Helper to get stored auth data
const getStoredAuthData = (): StoredAuthData | null => {
  const token = localStorage.getItem("auth_token");
  const userStr = localStorage.getItem("user");
  const tokenExpiry = localStorage.getItem("token_expiry");

  if (!token || !userStr || !tokenExpiry) return null;

  const expiryNum = parseInt(tokenExpiry, 10);

  // Check if token is already expired
  if (isTokenExpired(expiryNum)) {
    // Clean up expired data
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("refresh_token");
    return null;
  }

  return {
    token,
    user: JSON.parse(userStr),
    tokenExpiry: expiryNum,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  // Define logout FIRST before it's used in effects
  const logout = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("refresh_token");
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedAuth = getStoredAuthData();

        if (storedAuth) {
          setUser(storedAuth.user);
          // Token validation removed - /api/auth/me endpoint doesn't exist
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false); // Always set loading to false after check
      }
    };

    checkAuth();
  }, [logout]);

  // Set up token refresh on mount (only if user exists)
  useEffect(() => {
    if (!user) return;

    const storedAuth = getStoredAuthData();
    if (!storedAuth) return;

    // Schedule token refresh before expiry
    const timeUntilExpiry = storedAuth.tokenExpiry - Date.now();
    const refreshTime = Math.max(0, timeUntilExpiry - 5 * 60 * 1000); // Refresh 5 minutes before expiry

    if (refreshTime > 0) {
      const refreshTimeout = setTimeout(async () => {
        try {
          // Attempt to refresh token proactively
          const refreshToken = localStorage.getItem("refresh_token");
          if (refreshToken) {
            const response = await axiosInstance.post("/api/auth/refresh", {
              refreshToken,
            });

            const { token, tokenExpiry } = response.data;
            localStorage.setItem("auth_token", token);
            localStorage.setItem("token_expiry", tokenExpiry.toString());
            toast.success("Session refreshed successfully");
          }
        } catch (error) {
          console.error("Failed to refresh token:", error);
          // Don't log out immediately, let the next request handle it
        }
      }, refreshTime);

      return () => clearTimeout(refreshTimeout);
    }
  }, [user]);

  // Set up token expiration check interval
  useEffect(() => {
    if (!user) return;

    // Check token expiration every minute
    const intervalId = setInterval(() => {
      const tokenExpiry = localStorage.getItem("token_expiry");
      if (tokenExpiry && isTokenExpired(parseInt(tokenExpiry, 10))) {
        // Token expired, log out
        logout();
        toast.error("Your session has expired. Please log in again.");
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [user, logout]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post("/api/auth/login", credentials);

      if (response.data.token) {
        const { token, user, refreshToken } = response.data;

        // Calculate token expiry (default to 24 hours if not provided by backend)
        const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const tokenExpiry = Date.now() + expiresIn;

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token_expiry", tokenExpiry.toString());

        // Store refresh token if provided
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        setUser(user);
        toast.success(response.data.message || "Logged in successfully!");
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setIsLoading(true);

      // Convert firstName/lastName to name for backend
      const backendCredentials = {
        email: credentials.email,
        password: credentials.password,
        name: `${credentials.firstName} ${credentials.lastName}`.trim(),
      };

      const response = await axiosInstance.post(
        "/api/auth/register",
        backendCredentials,
      );

      if (response.data.token) {
        const { token, user, refreshToken } = response.data;

        // Calculate token expiry (default to 24 hours if not provided by backend)
        const expiresIn = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        const tokenExpiry = Date.now() + expiresIn;

        localStorage.setItem("auth_token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token_expiry", tokenExpiry.toString());

        // Store refresh token if provided
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }

        setUser(user);
        toast.success(response.data.message || "Account created successfully!");
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
