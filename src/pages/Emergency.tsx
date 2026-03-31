// src/pages/Emergency.tsx

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  emergencyService,
  EmergencyContact,
} from "@/services/emergency.service";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Plus, Edit2, Trash2, Star, AlertTriangle } from "lucide-react";
import { SOSButton } from "@/components/emergency/SOSButton";

export default function Emergency() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    relationship: "",
  });

  // Fetch contacts
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["emergencyContacts"],
    queryFn: emergencyService.getContacts,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: emergencyService.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      emergencyService.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: emergencyService.deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
  });

  const setPrimaryMutation = useMutation({
    mutationFn: emergencyService.setPrimaryContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyContacts"] });
    },
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingContact(null);
    setFormData({ name: "", phone: "", relationship: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSetPrimary = (id: number) => {
    setPrimaryMutation.mutate(id);
  };

  const primaryContact = contacts.find((c) => c.isPrimary);
  const otherContacts = contacts.filter((c) => !c.isPrimary);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Emergency Contacts
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your emergency contacts. These people will be alerted when you
          trigger SOS.
        </p>
      </div>

      {/* Center Circle SOS Button */}
      <div className="flex flex-col items-center justify-center py-8">
        <SOSButton contacts={contacts} />

        {/* Hint text */}
        {contacts.length > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            ⚠️ Tap the button above to send emergency alert to selected contacts
          </p>
        )}
      </div>

      {/* SOS Warning */}
      {contacts.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">No emergency contacts added yet</span>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Add at least one emergency contact to use the SOS feature.
          </p>
        </div>
      )}

      {/* Add Contact Button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Emergency Contact
        </Button>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingContact ? "Edit Contact" : "Add Emergency Contact"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Relationship
                </label>
                <Input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) =>
                    setFormData({ ...formData, relationship: e.target.value })
                  }
                  required
                  placeholder="Spouse, Parent, Friend, etc."
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  isLoading={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {editingContact ? "Update" : "Add"} Contact
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Primary Contact */}
      {primaryContact && (
        <Card className="border-primary-200 dark:border-primary-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              Primary Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {primaryContact.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {primaryContact.relationship} • {primaryContact.phone}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(primaryContact)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(primaryContact.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Contacts */}
      {otherContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Other Contacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {otherContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {contact.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {contact.relationship} • {contact.phone}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetPrimary(contact.id)}
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {contacts.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No emergency contacts added yet.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Add a contact to enable SOS alerts.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
