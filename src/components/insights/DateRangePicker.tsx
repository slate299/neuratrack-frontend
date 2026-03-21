// src/components/insights/DateRangePicker.tsx

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { DateRange } from "@/types";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangePicker({
  value,
  onChange,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
    { label: "All time", days: null },
  ];

  const handlePreset = (days: number | null) => {
    if (days === null) {
      onChange({ startDate: null, endDate: null });
    } else {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      onChange({ startDate, endDate });
    }
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (!value.startDate && !value.endDate) return "All time";
    if (value.startDate && !value.endDate) return "Custom range";
    if (value.startDate && value.endDate) {
      return `${value.startDate.toLocaleDateString()} - ${value.endDate.toLocaleDateString()}`;
    }
    return "Select range";
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Calendar className="h-4 w-4" />
        <span>{getDisplayText()}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset.days)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
