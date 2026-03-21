// src/components/medications/MedicationModal.tsx

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { medicationService } from "@/services/medication.service";
import { CreateMedicationRequest, Medication } from "@/types";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const medicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  times: z.array(z.string()).min(1, "At least one time is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  notes: z.string().optional(),
  active: z.boolean().optional(),
});

type MedicationFormData = z.infer<typeof medicationSchema>;

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingMedication?: Medication | null;
}

export default function MedicationModal({
  isOpen,
  onClose,
  onSuccess,
  editingMedication,
}: MedicationModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "daily",
      times: ["08:00"],
      startDate: new Date().toISOString().split("T")[0],
      active: true,
    },
  });

  const times = watch("times");

  const createMutation = useMutation({
    mutationFn: (data: CreateMedicationRequest) =>
      medicationService.createMedication(data),
    onSuccess: () => {
      toast.success("Medication added successfully");
      reset();
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to add medication");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<CreateMedicationRequest>;
    }) => medicationService.updateMedication(id, data),
    onSuccess: () => {
      toast.success("Medication updated successfully");
      reset();
      onSuccess();
    },
    onError: () => {
      toast.error("Failed to update medication");
    },
  });

  useEffect(() => {
    if (editingMedication) {
      setValue("name", editingMedication.name);
      setValue("dosage", editingMedication.dosage);
      setValue("frequency", editingMedication.frequency);
      setValue("times", editingMedication.times);
      setValue("startDate", editingMedication.startDate.split("T")[0]);
      setValue("notes", editingMedication.notes || "");
      setValue("active", editingMedication.active !== false);
    } else {
      reset();
    }
  }, [editingMedication, setValue, reset]);

  const onSubmit = async (data: MedicationFormData) => {
    if (editingMedication) {
      updateMutation.mutate({ id: editingMedication.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const addTime = () => {
    setValue("times", [...times, "12:00"]);
  };

  const removeTime = (index: number) => {
    const newTimes = [...times];
    newTimes.splice(index, 1);
    setValue("times", newTimes);
  };

  const updateTime = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setValue("times", newTimes);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingMedication ? "Edit Medication" : "Add Medication"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Medication Name *
            </label>
            <input
              {...register("name")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Levetiracetam"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Dosage *
            </label>
            <input
              {...register("dosage")}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., 500mg"
            />
            {errors.dosage && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.dosage.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Frequency *
            </label>
            <select
              {...register("frequency")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="twice-daily">Twice Daily</option>
              <option value="three-times-daily">Three Times Daily</option>
              <option value="weekly">Weekly</option>
              <option value="as-needed">As Needed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Times *
            </label>
            <div className="space-y-2">
              {times.map((time, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTime(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => removeTime(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addTime}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                + Add Time
              </button>
            </div>
            {errors.times && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.times.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date *
            </label>
            <input
              {...register("startDate")}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.startDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date (optional)
            </label>
            <input
              {...register("endDate")}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
              placeholder="Any additional notes..."
            />
          </div>

          {editingMedication && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register("active")}
                className="h-4 w-4 text-primary-600 rounded"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Active (show in reminders)
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={
                isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ||
              createMutation.isPending ||
              updateMutation.isPending
                ? "Saving..."
                : editingMedication
                  ? "Update"
                  : "Add"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
