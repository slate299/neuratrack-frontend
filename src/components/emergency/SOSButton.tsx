// src/components/emergency/SOSButton.tsx
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  emergencyService,
  EmergencyContact,
} from "@/services/emergency.service";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, X, MapPin, Loader2 } from "lucide-react";

interface SOSButtonProps {
  contacts: EmergencyContact[];
}

export const SOSButton = ({ contacts }: SOSButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [shareLocation, setShareLocation] = useState(true);
  const [location, setLocation] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const sosMutation = useMutation({
    mutationFn: async () => {
      let locationData = null;
      if (shareLocation && !location) {
        locationData = await getCurrentLocation();
      } else if (location) {
        locationData = location;
      }

      return emergencyService.triggerSOS({
        message: message.trim() || undefined,
        location: locationData || undefined,
      });
    },
    onSuccess: () => {
      setShowConfirm(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      setMessage("");
    },
    onError: (error) => {
      console.error("SOS failed:", error);
      alert("Failed to trigger SOS. Please try again.");
    },
  });

  const getCurrentLocation = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocationError("Geolocation not supported");
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = `${position.coords.latitude},${position.coords.longitude}`;
          setLocation(loc);
          setLocationError(null);
          resolve(loc);
        },
        (error) => {
          let errorMsg = "Unable to get location";
          if (error.code === 1) errorMsg = "Location permission denied";
          if (error.code === 2) errorMsg = "Location unavailable";
          if (error.code === 3) errorMsg = "Location request timeout";
          setLocationError(errorMsg);
          reject(new Error(errorMsg));
        },
        { timeout: 10000 },
      );
    });
  };

  const handleSOSTrigger = () => {
    if (contacts.length === 0) {
      alert("Please add emergency contacts first");
      return;
    }
    setShowConfirm(true);
    setShareLocation(true);
    setLocation(null);
    setLocationError(null);
  };

  const handleConfirm = async () => {
    await sosMutation.mutateAsync();
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setMessage("");
    setLocation(null);
    setLocationError(null);
  };

  if (showSuccess) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">SOS Alert Sent!</span>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
          Your emergency contacts have been notified.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* SOS Button */}
      <Button
        onClick={handleSOSTrigger}
        className="bg-red-600 hover:bg-red-700 text-white"
        disabled={contacts.length === 0}
      >
        <AlertTriangle className="w-4 h-4 mr-2" />
        SOS Emergency
      </Button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6" />
                Emergency SOS
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This will alert your emergency contacts:
            </p>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="text-sm">
                  <span className="font-medium">{contact.name}</span>
                  {contact.isPrimary && (
                    <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">
                      (Primary)
                    </span>
                  )}
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    {contact.phone}
                  </span>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={shareLocation}
                  onChange={(e) => setShareLocation(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Share my location
                </span>
                <MapPin className="w-4 h-4 text-gray-500" />
              </label>
              {shareLocation && locationError && (
                <p className="text-xs text-red-600 mt-1">{locationError}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Optional Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g., I'm having a seizure, please help..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleConfirm}
                isLoading={sosMutation.isPending}
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                {sosMutation.isPending ? "Sending..." : "Confirm SOS"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              This is not a medical alert system. In life-threatening
              emergencies, always call emergency services.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
