// src/pages/SeizureLogger.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { aiService } from "@/services/ai.service";
import { ParsedSeizureData, examplePrompts } from "@/types";
import { offlineSeizureService } from "@/services/offline-seizure.service";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import toast from "react-hot-toast";
import {
  Brain,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Edit3,
  Save,
  X,
} from "lucide-react";

// Form validation schema
const seizureFormSchema = z.object({
  occurredAt: z.string().min(1, "Date and time are required"),
  durationSeconds: z.number().optional().nullable(),
  seizureType: z.string().optional(),
  triggers: z.array(z.string()),
  symptoms: z.array(z.string()),
  postIctalSymptoms: z.array(z.string()),
  notes: z.string().optional(),
  aiConfidence: z.number().optional(),
});

type SeizureFormData = z.infer<typeof seizureFormSchema>;

export default function SeizureLogger() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [naturalNote, setNaturalNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedSeizureData | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SeizureFormData>({
    resolver: zodResolver(seizureFormSchema),
    defaultValues: {
      occurredAt: new Date().toISOString().slice(0, 16),
      durationSeconds: null,
      seizureType: "",
      triggers: [],
      symptoms: [],
      postIctalSymptoms: [],
      notes: "",
      aiConfidence: 0,
    },
  });

  // AI Parse Mutation
  const parseMutation = useMutation({
    mutationFn: (note: string) => aiService.parseSeizureNote(note),
    onSuccess: (data) => {
      setParsedData(data);
      setIsEditing(true);

      // Populate form with parsed data
      if (data.timestamp) {
        setValue("occurredAt", data.timestamp.slice(0, 16));
      }
      if (data.durationSeconds) {
        setValue("durationSeconds", data.durationSeconds);
      }
      if (data.seizureType) {
        setValue("seizureType", data.seizureType);
      }
      if (data.triggers?.length) {
        setValue("triggers", data.triggers);
      }
      if (data.symptoms?.length) {
        setValue("symptoms", data.symptoms);
      }
      if (data.postIctalSymptoms?.length) {
        setValue("postIctalSymptoms", data.postIctalSymptoms);
      }
      setValue("aiConfidence", data.confidence);

      toast.success("AI successfully parsed your seizure note!");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to parse note. Please try again.",
      );
    },
  });

  const { online } = useOfflineSync();

  // Save Seizure Mutation
  const saveMutation = useMutation({
    mutationFn: async (data: SeizureFormData) => {
      const requestData = {
        occurredAt: data.occurredAt,
        durationSeconds: data.durationSeconds || undefined,
        seizureType: data.seizureType || undefined,
        triggers: data.triggers.filter((t) => t.trim()),
        symptoms: data.symptoms.filter((s) => s.trim()),
        postIctalSymptoms: data.postIctalSymptoms.filter((p) => p.trim()),
        notes: data.notes || undefined,
        aiConfidence: data.aiConfidence,
      };

      if (!online) {
        // Offline - save locally
        const offlineResult =
          await offlineSeizureService.saveSeizureOffline(requestData);
        return { offline: true, data: offlineResult };
      }

      // Online - save to server
      const response = await aiService.saveSeizure(requestData);
      return { offline: false, data: response };
    },
    onSuccess: (result) => {
      if (result.offline) {
        toast.success("Seizure saved locally! Will sync when back online.");
      } else {
        toast.success("Seizure logged successfully!");
      }
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["seizures"] });
      reset();
      setNaturalNote("");
      setParsedData(null);
      setIsEditing(false);
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to save seizure. Please try again.",
      );
    },
  });

  // Add this new function for offline parsing
  const handleOfflineParse = () => {
    // Create a basic parsed data structure from the natural note
    const offlineParsedData: ParsedSeizureData = {
      timestamp: new Date().toISOString(),
      durationSeconds: undefined,
      seizureType: undefined,
      triggers: [],
      symptoms: [],
      postIctalSymptoms: [],
      confidence: 0, // Low confidence since it's offline
    };

    // Try to extract basic info from note (simple keyword matching)
    const note = naturalNote.toLowerCase();

    // Check for duration (e.g., "2 minutes", "30 seconds")
    const minuteMatch = note.match(/(\d+)\s*minute/);
    if (minuteMatch) {
      offlineParsedData.durationSeconds = parseInt(minuteMatch[1]) * 60;
    }
    const secondMatch = note.match(/(\d+)\s*second/);
    if (secondMatch) {
      offlineParsedData.durationSeconds = parseInt(secondMatch[1]);
    }

    // Check for seizure type
    if (note.includes("focal")) offlineParsedData.seizureType = "focal";
    else if (note.includes("generalized"))
      offlineParsedData.seizureType = "generalized";
    else if (note.includes("absence"))
      offlineParsedData.seizureType = "absence";
    else if (note.includes("tonic clonic") || note.includes("tonic-clonic"))
      offlineParsedData.seizureType = "tonic-clonic";
    else if (note.includes("myoclonic"))
      offlineParsedData.seizureType = "myoclonic";
    else if (note.includes("atonic")) offlineParsedData.seizureType = "atonic";

    // Check for common triggers
    const commonTriggers = [
      "stress",
      "lack of sleep",
      "sleep",
      "lights",
      "flashing",
      "alcohol",
      "fever",
      "illness",
      "missed medication",
      "medication",
    ];
    offlineParsedData.triggers = commonTriggers.filter((trigger) =>
      note.includes(trigger),
    );

    setParsedData(offlineParsedData);
    setIsEditing(true);

    // Populate form with parsed data
    setValue("occurredAt", offlineParsedData.timestamp.slice(0, 16));
    if (offlineParsedData.durationSeconds) {
      setValue("durationSeconds", offlineParsedData.durationSeconds);
    }
    if (offlineParsedData.seizureType) {
      setValue("seizureType", offlineParsedData.seizureType);
    }
    if (offlineParsedData.triggers.length) {
      setValue("triggers", offlineParsedData.triggers);
    }
    setValue("aiConfidence", 0);

    toast.success(
      "Offline mode: Using basic parsing. Please review and edit details.",
    );
  };

  const handleParse = () => {
    if (!naturalNote.trim()) {
      toast.error("Please enter a seizure description");
      return;
    }

    if (!online) {
      // Offline - use basic parsing
      handleOfflineParse();
    } else {
      // Online - use AI parsing
      parseMutation.mutate(naturalNote);
    }
  };

  const handleReset = () => {
    reset();
    setNaturalNote("");
    setParsedData(null);
    setIsEditing(false);
  };

  const handleUseExample = (text: string) => {
    setNaturalNote(text);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 dark:text-green-400";
    if (confidence >= 0.5) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return "High Confidence";
    if (confidence >= 0.5) return "Medium Confidence";
    return "Low Confidence - Please review";
  };

  const isParsing = parseMutation.isPending;
  const isSaving = saveMutation.isPending;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary-600" />
          AI Seizure Logger
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Describe your seizure in natural language, and our AI will help you
          log it accurately.
        </p>
      </div>

      {/* Natural Language Input Section */}
      {!isEditing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Describe your seizure
          </label>
          <textarea
            value={naturalNote}
            onChange={(e) => setNaturalNote(e.target.value)}
            placeholder="Example: I had a seizure around 3pm today. It lasted about 2 minutes. I was very tired afterward and had a headache. I think lack of sleep triggered it."
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          />

          {/* Example Prompts */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Try these examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handleUseExample(prompt.text)}
                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {prompt.title}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleParse}
            disabled={isParsing || !naturalNote.trim()}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isParsing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-5 w-5" />
                Parse with AI
              </>
            )}
          </button>
        </div>
      )}

      {/* Parsed Data Form */}
      {isEditing && parsedData && (
        <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))}>
          {/* Confidence Meter */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Parsed Data
                </h2>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-medium ${getConfidenceColor(parsedData.confidence)}`}
                >
                  {getConfidenceLabel(parsedData.confidence)}
                </p>
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      parsedData.confidence >= 0.8
                        ? "bg-green-500"
                        : parsedData.confidence >= 0.5
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${parsedData.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI confidence: {Math.round(parsedData.confidence * 100)}% - Please
              review and edit if needed.
            </p>
          </div>

          {/* Form Fields */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <h3 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Edit Seizure Details
            </h3>

            {/* Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                {...register("occurredAt")}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                  errors.occurredAt
                    ? "border-red-500 dark:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.occurredAt && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.occurredAt.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Duration (seconds)
              </label>
              <input
                type="number"
                {...register("durationSeconds", { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., 120"
              />
            </div>

            {/* Seizure Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seizure Type
              </label>
              <select
                {...register("seizureType")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select type...</option>
                <option value="focal">Focal Seizure</option>
                <option value="generalized">Generalized Seizure</option>
                <option value="absence">Absence Seizure</option>
                <option value="tonic-clonic">Tonic-Clonic Seizure</option>
                <option value="atonic">Atonic Seizure</option>
                <option value="myoclonic">Myoclonic Seizure</option>
              </select>
            </div>

            {/* Triggers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Triggers (comma separated)
              </label>
              <input
                {...register("triggers")}
                onChange={(e) => {
                  const value = e.target.value;
                  const triggersArray = value.split(",").map((t) => t.trim());
                  setValue("triggers", triggersArray);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., stress, lack of sleep, flashing lights"
              />
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Symptoms (comma separated)
              </label>
              <input
                {...register("symptoms")}
                onChange={(e) => {
                  const value = e.target.value;
                  const symptomsArray = value.split(",").map((s) => s.trim());
                  setValue("symptoms", symptomsArray);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., twitching, confusion, staring"
              />
            </div>

            {/* Post-Ictal Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Post-Ictal Symptoms (comma separated)
              </label>
              <input
                {...register("postIctalSymptoms")}
                onChange={(e) => {
                  const value = e.target.value;
                  const symptomsArray = value.split(",").map((s) => s.trim());
                  setValue("postIctalSymptoms", symptomsArray);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., tiredness, headache, confusion"
              />
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Notes
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Any additional details about the seizure..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Seizure
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
