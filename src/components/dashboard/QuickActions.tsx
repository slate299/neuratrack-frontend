// src/components/dashboard/QuickActions.tsx

import { Link } from "react-router-dom";
import {
  FileText,
  BarChart3,
  Pill,
  MessageSquare,
  Brain,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface Action {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  gradient: string;
}

const actions: Action[] = [
  {
    id: "log-seizure",
    title: "Log Seizure",
    description: "Record a new seizure event with AI",
    icon: FileText,
    path: "/seizure-logger",
    color: "bg-blue-500",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "view-insights",
    title: "View Insights",
    description: "See your seizure patterns & analytics",
    icon: BarChart3,
    path: "/insights",
    color: "bg-purple-500",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    id: "medications",
    title: "Medications",
    description: "Track your medication adherence",
    icon: Pill,
    path: "/medications",
    color: "bg-green-500",
    gradient: "from-green-500 to-green-600",
  },
  {
    id: "ai-chat",
    title: "AI Assistant",
    description: "Ask questions about your health data",
    icon: MessageSquare,
    path: "/chat",
    color: "bg-orange-500",
    gradient: "from-orange-500 to-orange-600",
  },
];

export default function QuickActions() {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/80 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="p-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
      </div>

      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.id}
            to={action.path}
            className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 hover:translate-x-1"
          >
            <div
              className={`bg-gradient-to-br ${action.gradient} p-2.5 rounded-xl shadow-md group-hover:scale-105 transition-transform`}
            >
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {action.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
          </Link>
        ))}
      </div>
    </div>
  );
}
