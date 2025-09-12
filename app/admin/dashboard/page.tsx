"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import axios from "axios";
import { Loader2, Plus, Trash2, Save, LogOut, Beaker, Edit, X, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

import ContaminantsNames from "@/lib/contaminants";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

import AddContaminantsForm from "@/modules/dashboard/AddContaminantsForm";
import ExistingContaminantsList from "@/modules/dashboard/ExistingContaminantsList";
import HeaderBar from "@/modules/dashboard/HeaderBar";

interface Contaminant {
  id?: string;
  name: string;
  removalRate: string;
  healthRisk: string;
}

export default function AdminDashboard() {
  const [contaminants, setContaminants] = useState<Contaminant[]>([
    { name: "", removalRate: "", healthRisk: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [existingContaminants, setExistingContaminants] = useState<Contaminant[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Contaminant>({ name: "", removalRate: "", healthRisk: "" });
  const [openComboboxes, setOpenComboboxes] = useState<{ [key: string]: boolean }>({});
  const [editComboboxOpen, setEditComboboxOpen] = useState(false);
  const router = useRouter();

  const uniqueContaminants = Array.from(new Set(ContaminantsNames));

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast("Please login to access admin dashboard");
      router.push("/admin");
      return;
    }
    fetchContaminants();
  }, [router]);

  const fetchContaminants = async () => {
    setLoadingExisting(true);
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get("/api/admin", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setExistingContaminants(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch contaminants:", error);
      toast("Failed to load contaminants");
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin");
  };

  const addContaminantField = () => {
    setContaminants([...contaminants, { name: "", removalRate: "", healthRisk: "" }]);
  };

  const removeContaminantField = (index: number) => {
    if (contaminants.length > 1) {
      setContaminants(contaminants.filter((_, i) => i !== index));
    }
  };

  const updateContaminant = (index: number, field: keyof Contaminant, value: string) => {
    const updated = [...contaminants];
    updated[index] = { ...updated[index], [field]: value };
    setContaminants(updated);
  };

  const validateContaminants = () => {
    for (const contaminant of contaminants) {
      if (!contaminant.name.trim() || !contaminant.removalRate.trim() || !contaminant.healthRisk.trim()) {
        return "All fields are required for each contaminant";
      }

      const duplicateInForm =
        contaminants.filter((c) => c.name.toLowerCase() === contaminant.name.toLowerCase()).length > 1;
      if (duplicateInForm) {
        return `Duplicate contaminant name: ${contaminant.name}`;
      }

      const existsInDb = existingContaminants.some(
        (existing) => existing.name.toLowerCase() === contaminant.name.toLowerCase()
      );
      if (existsInDb) {
        return `Contaminant already exists: ${contaminant.name}`;
      }
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validateContaminants();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.post(
        "/api/admin",
        { contaminants },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage({ type: "success", text: `Successfully added ${contaminants.length} contaminant(s)` });
        setContaminants([{ name: "", removalRate: "", healthRisk: "" }]);
        toast(`Successfully added ${contaminants.length} contaminant(s)`);
        fetchContaminants();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to save contaminants";
      setMessage({ type: "error", text: errorMessage });
      toast("Failed to save contaminants");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (contaminant: Contaminant) => {
    setEditingId(contaminant.id!);
    setEditForm({ ...contaminant });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", removalRate: "", healthRisk: "" });
  };

  const handleUpdateContaminant = async () => {
    if (!editForm.name.trim() || !editForm.removalRate.trim() || !editForm.healthRisk.trim()) {
      toast("All fields are required");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.put(
        `/api/admin`,
        { contaminant: editForm },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast("Contaminant updated successfully");
        setEditingId(null);
        setEditForm({ name: "", removalRate: "", healthRisk: "" });
        fetchContaminants();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to update contaminant";
      toast(errorMessage);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.delete(`/api/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { id },
      });

      if (response.status === 200) {
        toast("Contaminant deleted successfully");
        fetchContaminants();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to delete contaminant";
      toast(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <HeaderBar onLogout={handleLogout} />

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AddContaminantsForm
              message={message}
              contaminants={contaminants}
              onRemove={removeContaminantField}
              onUpdate={updateContaminant}
              onAdd={addContaminantField}
              onSave={handleSave}
              saving={saving}
              openComboboxes={openComboboxes}
              setOpenComboboxes={(next) => setOpenComboboxes(next)}
            />
          </div>

          <div className="mt-6 lg:mt-0">
            <ExistingContaminantsList
              items={existingContaminants}
              loadingExisting={loadingExisting}
              editingId={editingId}
              editForm={editForm}
              setEditForm={(next) => setEditForm(next)}
              onEdit={handleEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleUpdateContaminant}
              onDelete={handleDelete}
              editComboboxOpen={editComboboxOpen}
              setEditComboboxOpen={(open) => setEditComboboxOpen(open)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
