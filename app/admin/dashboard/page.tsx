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

  // Remove duplicates from ContaminantsNames to avoid key conflicts
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

      // Check for duplicates in the form
      const duplicateInForm =
        contaminants.filter((c) => c.name.toLowerCase() === contaminant.name.toLowerCase()).length > 1;
      if (duplicateInForm) {
        return `Duplicate contaminant name: ${contaminant.name}`;
      }

      // Check against existing contaminants
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
        fetchContaminants(); // Refresh the list
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
      <div className="border-b bg-[#101935] text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-gray-300 text-muted-foreground">Manage contaminants database</p>
              </div>
            </div>
            <Button variant="outline" className="text-black" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Add New Contaminants</span>
                </CardTitle>
                <CardDescription>
                  Add one or more contaminants to the Patriots filtration database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {message.text && (
                  <Alert variant={message.type === "error" ? "destructive" : "default"}>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}

                {contaminants.map((contaminant, index) => (
                  <div key={index} className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Contaminant {index + 1}</Badge>
                      {contaminants.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeContaminantField(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`name-${index}`}>Contaminant Name</Label>
                      <Popover
                        open={openComboboxes[`add-${index}`]}
                        onOpenChange={(open) =>
                          setOpenComboboxes({ ...openComboboxes, [`add-${index}`]: open })
                        }>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openComboboxes[`add-${index}`]}
                            className="h-10 w-full justify-between text-sm">
                            {contaminant.name
                              ? uniqueContaminants.find((name) => name === contaminant.name)
                              : "e.g., Arsenic"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Search contaminants..." />
                            <CommandList>
                              <CommandEmpty>No contaminant found.</CommandEmpty>
                              <CommandGroup>
                                {uniqueContaminants.map((name: string, idx: number) => (
                                  <CommandItem
                                    key={`${name}-${idx}`}
                                    value={name}
                                    onSelect={(currentValue) => {
                                      updateContaminant(
                                        index,
                                        "name",
                                        currentValue === contaminant.name ? "" : currentValue
                                      );
                                      setOpenComboboxes({ ...openComboboxes, [`add-${index}`]: false });
                                    }}>
                                    {name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`removal-${index}`}>Removal Rate</Label>
                      <Input
                        id={`removal-${index}`}
                        placeholder="e.g., 99.9%"
                        value={contaminant.removalRate}
                        onChange={(e) => updateContaminant(index, "removalRate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`health-${index}`}>Health Risk Description</Label>
                      <Textarea
                        id={`health-${index}`}
                        placeholder="Describe the health risks associated with this contaminant..."
                        value={contaminant.healthRisk}
                        onChange={(e) => updateContaminant(index, "healthRisk", e.target.value)}
                        rows={4}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={addContaminantField}
                    className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Another Contaminant</span>
                  </Button>

                  <Button onClick={handleSave} disabled={saving} className="flex items-center space-x-2">
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save All</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Existing Contaminants</CardTitle>
                <CardDescription>
                  Currently tracked contaminants ({existingContaminants.length})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 space-y-3 overflow-y-auto">
                  {loadingExisting ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : existingContaminants.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No contaminants found</p>
                  ) : (
                    existingContaminants.map((contaminant) => (
                      <div key={contaminant.id} className="rounded-lg border p-3">
                        {editingId === contaminant.id ? (
                          <div className="space-y-3">
                            <div>
                              <Label htmlFor={`edit-name-${contaminant.id}`} className="text-xs">
                                Name
                              </Label>
                              <Popover open={editComboboxOpen} onOpenChange={setEditComboboxOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={editComboboxOpen}
                                    className="h-8 w-full justify-between text-sm">
                                    {editForm.name
                                      ? uniqueContaminants.find((name) => name === editForm.name)
                                      : "Select name"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                  <Command>
                                    <CommandInput placeholder="Search contaminants..." />
                                    <CommandList>
                                      <CommandEmpty>No contaminant found.</CommandEmpty>
                                      <CommandGroup>
                                        {uniqueContaminants.map((name: string, idx: number) => (
                                          <CommandItem
                                            key={`edit-${name}-${idx}`}
                                            value={name}
                                            onSelect={(currentValue) => {
                                              setEditForm({
                                                ...editForm,
                                                name: currentValue === editForm.name ? "" : currentValue,
                                              });
                                              setEditComboboxOpen(false);
                                            }}>
                                            {name}
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <Label htmlFor={`edit-rate-${contaminant.id}`} className="text-xs">
                                Removal Rate
                              </Label>
                              <Input
                                id={`edit-rate-${contaminant.id}`}
                                value={editForm.removalRate}
                                onChange={(e) => setEditForm({ ...editForm, removalRate: e.target.value })}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edit-health-${contaminant.id}`} className="text-xs">
                                Health Risk
                              </Label>
                              <Textarea
                                id={`edit-health-${contaminant.id}`}
                                value={editForm.healthRisk}
                                onChange={(e) => setEditForm({ ...editForm, healthRisk: e.target.value })}
                                rows={3}
                                className="text-sm"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" onClick={handleUpdateContaminant} className="h-7">
                                <Check className="mr-1 h-3 w-3" />
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7">
                                <X className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="mb-2 flex items-center justify-between">
                              <h4 className="font-medium">{contaminant.name}</h4>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline">{contaminant.removalRate}</Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(contaminant)}
                                  className="h-6 w-6 p-0">
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDelete(contaminant.id!, contaminant.name)}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {contaminant.healthRisk}
                            </p>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
