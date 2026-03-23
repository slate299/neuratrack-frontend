// src/App.tsx

import { lazy, Suspense } from "react"; // Import lazy and Suspense from React
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";
import DashboardLayout from "@/components/layout/DashboardLayout";

// Lazy load page components for better performance
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const SeizureLogger = lazy(() => import("@/pages/SeizureLogger"));
const Insights = lazy(() => import("@/pages/Insights"));
const Medications = lazy(() => import("@/pages/Medications"));
const Chat = lazy(() => import("@/pages/Chat"));
const Emergency = lazy(() => import("@/pages/Emergency"));
const Reports = lazy(() => import("@/pages/Reports"));
const SharedReport = lazy(() => import("@/pages/SharedReport"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// Component to handle initial app loading
const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  // Show loading screen while checking initial auth
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public Shared Report Route - No Auth Required */}
        <Route path="/share/:token" element={<SharedReport />} />

        {/* Protected Routes - Require Authentication */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/seizure-logger"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SeizureLogger />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/insights"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Insights />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/medications"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Medications />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Chat />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div>Profile - Coming Soon</div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Emergency />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center">
              404 - Page Not Found
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
