// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AuthLoadingScreen } from "@/components/auth/AuthLoadingScreen";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard"; // Import Dashboard

// Component to handle initial app loading
const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

  // Show loading screen while checking initial auth
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
              <div>Seizure Logger - Coming Soon</div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/insights"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <div>Insights - Coming Soon</div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/medications"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <div>Medications - Coming Soon</div>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <div>AI Chat - Coming Soon</div>
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

      {/* 404 Page */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
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
