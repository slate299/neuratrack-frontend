// src/main.tsx

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { queryClient } from "./lib/react-query";
import { env, devLog } from "./config/env";
import "./index.css";

// Development logging
if (env.enableLogging && env.isDevelopment) {
  devLog("Initializing app with config:", {
    environment: env.appEnv,
    apiBaseUrl: env.apiBaseUrl,
    features: {
      devTools: env.enableDevTools,
      mockApi: env.enableMockApi,
    },
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: env.isDevelopment ? "#363636" : "#1F2937",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />
      {/* Only show React Query Devtools in development */}
      {env.enableDevTools && env.isDevelopment && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  </StrictMode>,
);
