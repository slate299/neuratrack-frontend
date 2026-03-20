import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<div>Login Page - Coming Soon</div>} />
        <Route
          path="/register"
          element={<div>Register Page - Coming Soon</div>}
        />
        <Route path="/dashboard" element={<div>Dashboard - Coming Soon</div>} />
        <Route
          path="/seizure-logger"
          element={<div>Seizure Logger - Coming Soon</div>}
        />
        <Route path="/insights" element={<div>Insights - Coming Soon</div>} />
        <Route
          path="/medications"
          element={<div>Medications - Coming Soon</div>}
        />
        <Route path="/chat" element={<div>AI Chat - Coming Soon</div>} />
        <Route path="/profile" element={<div>Profile - Coming Soon</div>} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
