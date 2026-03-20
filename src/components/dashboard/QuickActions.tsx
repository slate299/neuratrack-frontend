// src/components/dashboard/QuickActions.tsx

import { Link } from "react-router-dom";
import { FileText, BarChart3, Pill, MessageSquare, User } from "lucide-react";

interface Action {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
}

const actions: Action[] = [
  {
    id: "log-seizure",
    title: "Log Seizure",
    description: "Record a new seizure event",
    icon: FileText,
    path: "/seizure-logger",
    color: "bg-blue-500",
  },
  {
    id: "view-insights",
    title: "View Insights",
    description: "See your seizure patterns",
    icon: BarChart3,
    path: "/insights",
    color: "bg-purple-500",
  },
  {
    id: "medications",
    title: "Medications",
    description: "Track your medications",
    icon: Pill,
    path: "/medications",
    color: "bg-green-500",
  },
  {
    id: "ai-chat",
    title: "AI Assistant",
    description: "Ask questions about your data",
    icon: MessageSquare,
    path: "/chat",
    color: "bg-orange-500",
  },
];

export default function QuickActions() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Quick Actions
      </h2>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.path}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
          >
            <div className={`${action.color} p-2 rounded-lg`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {action.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
