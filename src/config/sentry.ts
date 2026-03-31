// src/config/sentry.ts

import * as Sentry from "@sentry/react";

const isProduction = import.meta.env.MODE === "production";

export const initSentry = () => {
  if (!isProduction) {
    console.log("Sentry disabled in development mode");
    return;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN;

  if (!dsn) {
    console.warn("Sentry DSN not configured. Skipping Sentry initialization.");
    return;
  }
  h;
  // Simplified initialization without BrowserTracing
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: true,
    // Remove tracesSampleRate and replays for now
    beforeSend(event) {
      if (
        event.exception?.values?.some(
          (value) =>
            value.value?.includes("401") || value.value?.includes("403"),
        )
      ) {
        return null;
      }
      return event;
    },
  });

  console.log("✅ Sentry initialized");
};

export const captureException = (
  error: Error,
  context?: Record<string, any>,
) => {
  if (isProduction && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.captureException(error, { extra: context });
  } else {
    console.error("Error captured:", error, context);
  }
};

export const addBreadcrumb = (message: string, data?: Record<string, any>) => {
  if (isProduction && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.addBreadcrumb({ message, data, level: "info" });
  }
};
