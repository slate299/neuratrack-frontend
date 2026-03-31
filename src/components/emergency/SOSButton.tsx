// src/components/emergency/SOSButton.tsx

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  emergencyService,
  EmergencyContact,
} from "@/services/emergency.service";
import { Button } from "@/components/ui/Button";
import {
  AlertTriangle,
  X,
  MapPin,
  Loader2,
  CheckCircle,
  ChevronDown,
} from "lucide-react";

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

  // New state for contact selection
  const [selectedContactIds, setSelectedContactIds] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(true);
  const [showContactDropdown, setShowContactDropdown] = useState(false);

  // Initialize with all contacts selected when dialog opens
  const handleOpenDialog = () => {
    setSelectedContactIds(contacts.map((c) => c.id));
    setSelectAll(true);
    setShowConfirm(true);
    setShareLocation(true);
    setLocation(null);
    setLocationError(null);
  };

  const sosMutation = useMutation({
    mutationFn: async () => {
      let locationData = null;
      if (shareLocation && !location) {
        locationData = await getCurrentLocation();
      } else if (location) {
        locationData = location;
      }

      // Filter selected contacts
      const selectedContacts = contacts.filter((c) =>
        selectedContactIds.includes(c.id),
      );

      if (selectedContacts.length === 0) {
        throw new Error("No contacts selected");
      }

      return emergencyService.triggerSOS({
        message: message.trim() || undefined,
        location: locationData || undefined,
        contactIds: selectedContactIds, // Pass selected contact IDs to backend
      });
    },
    onSuccess: () => {
      setShowConfirm(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      setMessage("");
      setSelectedContactIds([]);
      setSelectAll(true);
    },
    onError: (error: any) => {
      console.error("SOS failed:", error);
      alert(error.message || "Failed to trigger SOS. Please try again.");
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
    handleOpenDialog();
  };

  const toggleContact = (contactId: number) => {
    setSelectedContactIds((prev) => {
      const newSelection = prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId];

      setSelectAll(newSelection.length === contacts.length);
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedContactIds([]);
      setSelectAll(false);
    } else {
      setSelectedContactIds(contacts.map((c) => c.id));
      setSelectAll(true);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setMessage("");
    setLocation(null);
    setLocationError(null);
    setSelectedContactIds([]);
    setSelectAll(true);
    setShowContactDropdown(false);
  };

  // Get primary contact
  const primaryContact = contacts.find((c) => c.isPrimary);
  const otherContacts = contacts.filter((c) => !c.isPrimary);

  if (showSuccess) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">SOS Alert Sent!</span>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
          Your selected emergency contacts have been notified.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* SOS Button - Large Circle */}
      <button
        onClick={handleSOSTrigger}
        disabled={contacts.length === 0}
        className={`
    w-40 h-40 rounded-full 
    flex flex-col items-center justify-center gap-2
    transition-all duration-300 transform hover:scale-105 active:scale-95
    shadow-2xl mx-auto
    ${
      contacts.length === 0
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gradient-to-br from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 animate-pulse"
    }
  `}
      >
        <AlertTriangle className="w-12 h-12 text-white" />
        <span className="text-white font-bold text-lg">SOS</span>
        <span className="text-white text-xs">Emergency</span>
      </button>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 pt-0 pb-2">
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

            <p className="text-gray-700 dark:text-gray-300 mb-3">
              Select who to alert:
            </p>

            {/* Contact Selection */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
              {/* Select All Toggle */}
              <button
                onClick={toggleSelectAll}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors mb-2"
              >
                <span className="font-medium text-sm">All Contacts</span>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectAll ? "bg-red-500 border-red-500" : "border-gray-400"}`}
                >
                  {selectAll && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
              </button>

              {/* Primary Contact (Starred) */}
              {primaryContact && (
                <div
                  onClick={() => toggleContact(primaryContact.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedContactIds.includes(primaryContact.id)
                      ? "bg-red-50 dark:bg-red-900/20"
                      : "hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">⭐</span>
                    <div>
                      <p className="font-medium text-sm">
                        {primaryContact.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {primaryContact.relationship} • {primaryContact.phone}
                      </p>
                    </div>
                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedContactIds.includes(primaryContact.id) ? "bg-red-500 border-red-500" : "border-gray-400"}`}
                  >
                    {selectedContactIds.includes(primaryContact.id) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              )}

              {/* Other Contacts */}
              {otherContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedContactIds.includes(contact.id)
                      ? "bg-red-50 dark:bg-red-900/20"
                      : "hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">{contact.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {contact.relationship} • {contact.phone}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedContactIds.includes(contact.id) ? "bg-red-500 border-red-500" : "border-gray-400"}`}
                  >
                    {selectedContactIds.includes(contact.id) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              ))}

              {contacts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  No contacts added. Please add contacts in settings.
                </p>
              )}
            </div>

            {/* Location Toggle */}
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

            {/* Optional Message */}
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

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => sosMutation.mutate()}
                isLoading={sosMutation.isPending}
                disabled={selectedContactIds.length === 0}
                className="bg-red-600 hover:bg-red-700 flex-1"
              >
                {sosMutation.isPending
                  ? "Sending..."
                  : `Alert ${selectedContactIds.length} Contact${selectedContactIds.length !== 1 ? "s" : ""}`}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>

            {selectedContactIds.length === 0 && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Please select at least one contact to alert
              </p>
            )}

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
