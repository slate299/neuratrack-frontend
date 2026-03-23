// src/components/layout/MobileBottomNav.tsx

import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Pill,
  MessageSquare,
  AlertTriangle,
  FileText, // ADD THIS IMPORT
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Home", icon: LayoutDashboard },
  { path: "/seizure-logger", label: "Log", icon: Activity },
  { path: "/insights", label: "Insights", icon: BarChart3 },
  { path: "/medications", label: "Meds", icon: Pill },
  { path: "/reports", label: "Reports", icon: FileText }, // ADD REPORTS
  { path: "/chat", label: "Chat", icon: MessageSquare },
  { path: "/emergency", label: "SOS", icon: AlertTriangle },
];

export default function MobileBottomNav() {
  const location = useLocation();

  // Don't show on login/register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 lg:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? item.label === "SOS"
                    ? "text-red-600 dark:text-red-400"
                    : "text-primary-600 dark:text-primary-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
