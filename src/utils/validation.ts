// src/utils/validation.ts

import { z } from "zod";

// Password strength checker
export const checkPasswordStrength = (
  password: string,
): {
  score: number;
  label: "Weak" | "Medium" | "Strong";
  color: string;
  requirements: string[];
} => {
  let score = 0;
  const requirements: string[] = [];

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    requirements.push("At least 8 characters");
  }

  // Uppercase letter check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    requirements.push("At least one uppercase letter");
  }

  // Lowercase letter check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    requirements.push("At least one lowercase letter");
  }

  // Number check
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    requirements.push("At least one number");
  }

  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    requirements.push("At least one special character (!@#$%^&*)");
  }

  let label: "Weak" | "Medium" | "Strong";
  let color: string;

  if (score <= 2) {
    label = "Weak";
    color = "text-red-600 dark:text-red-400";
  } else if (score <= 4) {
    label = "Medium";
    color = "text-yellow-600 dark:text-yellow-400";
  } else {
    label = "Strong";
    color = "text-green-600 dark:text-green-400";
  }

  return { score, label, color, requirements };
};

// Enhanced email validation with domain check
const commonEmailDomains = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "protonmail.com",
  "aol.com",
];

export const validateEmail = (
  email: string,
): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: false, message: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  const domain = email.split("@")[1];
  if (domain && !commonEmailDomains.includes(domain.toLowerCase())) {
    // Warning, not error - user can still proceed
    return { isValid: true, message: "Please double-check your email domain" };
  }

  return { isValid: true };
};

// Enhanced login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .refine((email) => validateEmail(email).isValid, {
      message: "Please enter a valid email address",
    }),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

// Enhanced registration schema with password strength
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters")
      .regex(
        /^[a-zA-Z\s-]+$/,
        "First name can only contain letters, spaces, and hyphens",
      ),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters")
      .regex(
        /^[a-zA-Z\s-]+$/,
        "Last name can only contain letters, spaces, and hyphens",
      ),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .refine((email) => validateEmail(email).isValid, {
        message: "Please enter a valid email address",
      }),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Export types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
